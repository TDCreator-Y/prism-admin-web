import { nextTick, ref } from 'vue';
import type { MenuItem, ThemeConfig } from '@/layouts/modules/global-menu/types';

const { mockReadJsonStorage, mockRemoveComponentCacheByPath } = vi.hoisted(() => ({
  mockReadJsonStorage: vi.fn(),
  mockRemoveComponentCacheByPath: vi.fn(),
}));

vi.mock('@/utils/storage-keys', () => ({
  STORAGE_KEYS: {
    tabs: 'ui:tabs',
  },
  STORAGE_KEY_CANDIDATES: {
    tabs: ['ui:tabs'],
  },
  readJsonStorage: mockReadJsonStorage,
}));

vi.mock('@/store/modules/teleport-manager', () => ({
  useTeleportManager: () => ({
    removeComponentCacheByPath: mockRemoveComponentCacheByPath,
  }),
}));

import { createTabsDomain } from '@/layouts/modules/global-menu/tabs-domain';

function createTheme(preserveHomeTab = true) {
  return ref<ThemeConfig>({
    layout: 'side',
    primaryColor: '#3b82f6',
    darkMode: false,
    siderWidth: 220,
    showTabs: true,
    showBreadcrumb: true,
    showFooter: false,
    showWatermark: false,
    watermarkText: 'Dashboard LightWeight',
    preserveHomeTab,
  });
}

function createMenuList(): MenuItem[] {
  return [
    {
      key: 'home',
      path: '/home',
      title: '首页',
      icon: 'fa-home',
    },
    {
      key: 'dashboard',
      path: '/dashboard',
      title: '仪表盘',
      routeId: 'dashboard-route',
    },
    {
      key: 'reports',
      path: '/reports',
      title: '报表',
      routeId: 'reports-route',
    },
    {
      key: 'settings',
      path: '/settings',
      title: '设置',
      routeId: 'settings-route',
    },
  ];
}

describe('tabs-domain', () => {
  beforeEach(() => {
    localStorage.clear();
    mockReadJsonStorage.mockReset();
    mockRemoveComponentCacheByPath.mockReset();
  });

  it('updates existing tabs instead of duplicating the same path', async () => {
    mockReadJsonStorage.mockReturnValue([
      {
        key: 'dashboard-old',
        path: '/dashboard',
        title: '旧标题',
        icon: 'fa-legacy',
      },
    ]);

    const domain = createTabsDomain({
      menuList: ref(createMenuList()),
      theme: createTheme(),
    });

    domain.addTab({
      key: 'dashboard',
      path: '/dashboard',
      title: '新标题',
      icon: 'fa-chart-line',
      routeId: 'dashboard-route',
    });

    expect(domain.tabsList.value).toEqual([
      expect.objectContaining({
        key: 'dashboard',
        path: '/dashboard',
        title: '新标题',
        icon: 'fa-chart-line',
        routeId: 'dashboard-route',
      }),
    ]);

    await nextTick();
    expect(localStorage.getItem('ui:tabs')).toContain('新标题');
  });

  it('preserves the home tab when removing tabs to the left of the current tab', async () => {
    mockReadJsonStorage.mockReturnValue([
      {
        key: 'home',
        path: '/home',
        title: '首页',
      },
      {
        key: 'dashboard',
        path: '/dashboard',
        title: '仪表盘',
        routeId: 'dashboard-route',
      },
      {
        key: 'reports',
        path: '/reports',
        title: '报表',
        routeId: 'reports-route',
      },
      {
        key: 'settings',
        path: '/settings',
        title: '设置',
        routeId: 'settings-route',
      },
    ]);

    const domain = createTabsDomain({
      menuList: ref(createMenuList()),
      theme: createTheme(true),
    });

    await domain.removeLeftTabs('/settings');

    expect(domain.tabsList.value.map(tab => tab.path)).toEqual(['/home', '/settings']);
    expect(mockRemoveComponentCacheByPath).toHaveBeenCalledTimes(2);
    expect(mockRemoveComponentCacheByPath).toHaveBeenCalledWith('/dashboard', 'dashboard-route');
    expect(mockRemoveComponentCacheByPath).toHaveBeenCalledWith('/reports', 'reports-route');
  });

  it('preserves the home tab when removing tabs to the right', async () => {
    mockReadJsonStorage.mockReturnValue([
      { key: 'dashboard', path: '/dashboard', title: '仪表盘', routeId: 'dashboard-route' },
      { key: 'reports', path: '/reports', title: '报表', routeId: 'reports-route' },
      { key: 'home', path: '/home', title: '首页' },
      { key: 'settings', path: '/settings', title: '设置', routeId: 'settings-route' },
    ]);

    const domain = createTabsDomain({
      menuList: ref(createMenuList()),
      theme: createTheme(true),
    });

    await domain.removeRightTabs('/reports');

    expect(domain.tabsList.value.map(t => t.path)).toContain('/home');
    expect(domain.tabsList.value.map(t => t.path)).not.toContain('/settings');
  });

  it('removes home tab when preserveHomeTab is false', async () => {
    mockReadJsonStorage.mockReturnValue([
      { key: 'home', path: '/home', title: '首页' },
      { key: 'dashboard', path: '/dashboard', title: '仪表盘', routeId: 'dashboard-route' },
    ]);

    const domain = createTabsDomain({
      menuList: ref(createMenuList()),
      theme: createTheme(false),
    });

    await domain.removeAllTabs();

    expect(domain.tabsList.value).toHaveLength(0);
  });

  it('removes all non-home tabs and keeps home available for future navigation', async () => {
    mockReadJsonStorage.mockReturnValue([
      {
        key: 'dashboard',
        path: '/dashboard',
        title: '仪表盘',
        routeId: 'dashboard-route',
      },
      {
        key: 'settings',
        path: '/settings',
        title: '设置',
        routeId: 'settings-route',
      },
    ]);

    const domain = createTabsDomain({
      menuList: ref(createMenuList()),
      theme: createTheme(true),
    });

    await domain.removeAllTabs();

    expect(domain.tabsList.value).toEqual([
      expect.objectContaining({
        key: 'home',
        path: '/home',
        title: '首页',
      }),
    ]);
    expect(mockRemoveComponentCacheByPath).toHaveBeenCalledWith('/dashboard', 'dashboard-route');
    expect(mockRemoveComponentCacheByPath).toHaveBeenCalledWith('/settings', 'settings-route');
  });
});
