import { ref, watch, type Ref } from 'vue';
import type { MenuItem, ThemeConfig } from './types';
import { readJsonStorage, STORAGE_KEYS, STORAGE_KEY_CANDIDATES } from '@/utils/storage-keys';
import { useTeleportManager } from '@/store/modules/teleport-manager';

const HOME_TAB_PATH = '/home';
const DEFAULT_HOME_TAB: MenuItem = {
  key: 'home',
  path: HOME_TAB_PATH,
  title: '首页',
  icon: 'fa-home',
};

function loadTabsFromStorage(): MenuItem[] {
  try {
    return readJsonStorage<MenuItem[]>(STORAGE_KEY_CANDIDATES.tabs, []);
  } catch (error) {
    console.warn('Failed to load tabs from storage:', error);
  }
  return [];
}

function persistTabs(tabs: MenuItem[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.tabs, JSON.stringify(tabs));
  } catch (error) {
    console.warn('Failed to save tabs:', error);
  }
}

function isHomeTab(path: string) {
  return path === HOME_TAB_PATH;
}

async function cleanupTeleportCache(path: string, routeId?: string) {
  try {
    const teleportManager = useTeleportManager();
    await Promise.resolve(teleportManager.removeComponentCacheByPath(path, routeId));
  } catch {
    // 忽略缓存清理失败，避免影响标签页主流程
  }
}

export function createTabsDomain(params: {
  menuList: Ref<MenuItem[]>;
  theme: Ref<ThemeConfig>;
}) {
  const { menuList, theme } = params;
  const tabsList = ref<MenuItem[]>(loadTabsFromStorage());

  watch(
    () => tabsList.value.map(tab => `${tab.path}|${tab.key}|${tab.title}|${tab.icon || ''}`).join(','),
    () => {
      persistTabs(tabsList.value);
    }
  );

  function addTab(menu: MenuItem) {
    if (menu.path === '/blank' || menu.key === 'blank') return;

    const index = tabsList.value.findIndex(tab => tab.path === menu.path);
    if (index === -1) {
      tabsList.value.push({ ...menu });
      return;
    }

    const existing = tabsList.value[index];
    tabsList.value[index] = {
      ...existing,
      ...menu,
      key: menu.key || existing.key,
      title: menu.title || existing.title,
      icon: menu.icon || existing.icon,
    };
  }

  function getHomeTab(): MenuItem {
    const existing = tabsList.value.find(tab => isHomeTab(tab.path));
    if (existing) return existing;

    const findInMenu = (list: MenuItem[]): MenuItem | null => {
      for (const item of list) {
        if (isHomeTab(item.path)) return item;
        if (item.children?.length) {
          const found = findInMenu(item.children);
          if (found) return found;
        }
      }
      return null;
    };

    const menuHome = findInMenu(menuList.value);
    return menuHome ? { ...menuHome } : { ...DEFAULT_HOME_TAB };
  }

  function ensureHomeTab() {
    if (!theme.value.preserveHomeTab) return;
    if (tabsList.value.some(tab => isHomeTab(tab.path))) return;
    tabsList.value.unshift(getHomeTab());
  }

  function getProtectedPaths(paths: string[], preserveHome = false) {
    if (!preserveHome || !theme.value.preserveHomeTab) return paths;
    return paths.filter(path => !isHomeTab(path));
  }

  async function removeTab(path: string) {
    const index = tabsList.value.findIndex(tab => tab.path === path);
    if (index === -1) return;

    const [tab] = tabsList.value.splice(index, 1);
    await cleanupTeleportCache(path, tab?.routeId);
  }

  async function removeTabs(paths: string[], options?: { preserveHome?: boolean }) {
    if (paths.length === 0) return;

    const removablePaths = getProtectedPaths(paths, options?.preserveHome);
    if (removablePaths.length === 0) return;

    const tabsToRemove = removablePaths
      .map(path => {
        const index = tabsList.value.findIndex(tab => tab.path === path);
        return index > -1 ? tabsList.value.splice(index, 1)[0] : null;
      })
      .filter((tab): tab is MenuItem => tab !== null);

    await Promise.all(
      tabsToRemove.map(tab => cleanupTeleportCache(tab.path, tab.routeId))
    );
  }

  async function removeOtherTabs(path: string) {
    const paths = tabsList.value.filter(tab => tab.path !== path).map(tab => tab.path);
    await removeTabs(paths);
  }

  async function removeLeftTabs(path: string) {
    const index = tabsList.value.findIndex(tab => tab.path === path);
    if (index <= 0) return;

    const paths = tabsList.value.slice(0, index).map(tab => tab.path);
    await removeTabs(paths, { preserveHome: true });
    ensureHomeTab();
  }

  async function removeRightTabs(path: string) {
    const index = tabsList.value.findIndex(tab => tab.path === path);
    if (index === -1 || index >= tabsList.value.length - 1) return;

    const paths = tabsList.value.slice(index + 1).map(tab => tab.path);
    await removeTabs(paths, { preserveHome: true });
    ensureHomeTab();
  }

  async function removeAllTabs() {
    const paths = tabsList.value.map(tab => tab.path);
    await removeTabs(paths, { preserveHome: true });
    ensureHomeTab();
  }

  function resetTabsState() {
    tabsList.value = [];
  }

  return {
    tabsList,
    addTab,
    removeTab,
    removeOtherTabs,
    removeLeftTabs,
    removeRightTabs,
    removeAllTabs,
    resetTabsState,
  };
}
