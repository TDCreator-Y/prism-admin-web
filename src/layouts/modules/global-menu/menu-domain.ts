import { computed, ref, type Ref } from 'vue';
import type { RouteRecordRaw } from 'vue-router';
import type { MenuConfig, MenuItem, ThemeConfig } from './types';
import { transformRouteToMenu, findMenuParents, findMenuByPath } from './types';

function findMenuInTree(list: MenuItem[], path: string): boolean {
  for (const item of list) {
    if (item.path === path) return true;
    if (item.children && findMenuInTree(item.children, path)) return true;
  }
  return false;
}

function findMenuRoot(list: MenuItem[], path: string): MenuItem | null {
  for (const item of list) {
    if (item.path === path) return item;
    if (item.children && findMenuInTree(item.children, path)) return item;
  }
  return null;
}




export function createMenuDomain(theme: Ref<ThemeConfig>) {
  const menuList = ref<MenuItem[]>([]);
  const openKeys = ref<string[]>([]);
  const selectedKey = ref<string>('');
  const mixActiveRootKey = ref<string>('');
  const menuConfig = ref<MenuConfig>({
    showFullPath: false,
    accordion: true,
    defaultOpenKeys: [],
    defaultSelectedKey: '',
    collapsed: false,
  });
  const siderCollapsed = ref(false);

  function syncMixActiveRoot(path: string) {
    if (theme.value.layout !== 'mix') return;
    const root = findMenuRoot(menuList.value, path);
    if (root) {
      mixActiveRootKey.value = root.key;
    }
  }

  const mixHeaderMenuList = computed(() => {
    if (theme.value.layout !== 'mix') return [];
    return menuList.value
      .filter(item => !item.hidden)
      .map(item => ({ ...item, children: undefined }));
  });

  const mixSiderMenuList = computed(() => {
    if (theme.value.layout !== 'mix') return [];
    const root = menuList.value.find(item => item.key === mixActiveRootKey.value);
    return root?.children || [];
  });

  const breadcrumbs = computed(() => {
    // selectedKey stores the route path, so look up by path (not by item.key)
    const selectedMenu = findMenuByPath(menuList.value, selectedKey.value);
    if (!selectedMenu) return [];
    return [...findMenuParents(menuList.value, selectedMenu.path), selectedMenu];
  });

  function setMenuFromRoutes(routes: RouteRecordRaw[]) {
    menuList.value = transformRouteToMenu(routes);
    if (selectedKey.value) {
      syncMixActiveRoot(selectedKey.value);
    }
  }

  function setSelectedKey(path: string) {
    selectedKey.value = path;
    syncMixActiveRoot(path);
    const parents = findMenuParents(menuList.value, path);
    openKeys.value = parents.map(parent => parent.key);
  }

  function toggleOpenKey(key: string) {
    const index = openKeys.value.indexOf(key);
    if (index > -1) {
      openKeys.value.splice(index, 1);
    } else {
      openKeys.value.push(key);
    }
  }

  function openKey(key: string) {
    if (!openKeys.value.includes(key)) {
      openKeys.value.push(key);
    }
  }

  function closeAllKeys() {
    openKeys.value = [];
  }

  function setMixActiveRoot(key: string) {
    mixActiveRootKey.value = key;
  }

  function setSiderCollapsed(collapsed: boolean) {
    siderCollapsed.value = collapsed;
  }

  function toggleSider() {
    siderCollapsed.value = !siderCollapsed.value;
  }

  function resetMenuState() {
    openKeys.value = [];
    selectedKey.value = '';
    siderCollapsed.value = false;
  }

  return {
    menuList,
    openKeys,
    selectedKey,
    mixActiveRootKey,
    menuConfig,
    siderCollapsed,
    mixHeaderMenuList,
    mixSiderMenuList,
    breadcrumbs,
    setMenuFromRoutes,
    setSelectedKey,
    toggleOpenKey,
    openKey,
    closeAllKeys,
    setMixActiveRoot,
    setSiderCollapsed,
    toggleSider,
    syncMixActiveRoot,
    resetMenuState,
  };
}
