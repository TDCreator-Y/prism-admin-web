import { ref } from 'vue';
import type { MenuItem, ThemeConfig } from '@/layouts/modules/global-menu/types';
import { createMenuDomain } from '@/layouts/modules/global-menu/menu-domain';

function createTheme(layout: ThemeConfig['layout'] = 'mix') {
  return ref<ThemeConfig>({
    layout,
    primaryColor: '#3b82f6',
    darkMode: false,
    siderWidth: 220,
    showTabs: true,
    showBreadcrumb: true,
    showFooter: false,
    showWatermark: false,
    watermarkText: 'Prism',
    preserveHomeTab: true,
  });
}

const menuTree: MenuItem[] = [
  {
    key: 'dashboard',
    path: '/dashboard',
    title: '仪表盘',
    children: [
      {
        key: 'reports',
        path: '/dashboard/reports',
        title: '报表中心',
        children: [
          {
            key: 'detail',
            path: '/dashboard/reports/detail',
            title: '报表详情',
          },
        ],
      },
    ],
  },
  {
    key: 'hidden-root',
    path: '/hidden-root',
    title: '隐藏根菜单',
    hidden: true,
  },
];

describe('menu-domain', () => {
  it('syncs selected path to open keys, mix root and breadcrumbs', () => {
    const domain = createMenuDomain(createTheme('mix'));
    domain.menuList.value = structuredClone(menuTree);

    domain.setSelectedKey('/dashboard/reports/detail');

    expect(domain.selectedKey.value).toBe('/dashboard/reports/detail');
    expect(domain.openKeys.value).toEqual(['dashboard', 'reports']);
    expect(domain.mixActiveRootKey.value).toBe('dashboard');
  });

  it('projects mix header and sider menus from the active root', () => {
    const domain = createMenuDomain(createTheme('mix'));
    domain.menuList.value = structuredClone(menuTree);

    domain.setSelectedKey('/dashboard/reports');

    expect(domain.mixHeaderMenuList.value).toEqual([
      expect.objectContaining({
        key: 'dashboard',
        title: '仪表盘',
        children: undefined,
      }),
    ]);
    expect(domain.mixSiderMenuList.value).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: 'reports',
          title: '报表中心',
        }),
      ])
    );
  });

  it('computes breadcrumbs in top-to-leaf order for a deeply nested path', () => {
    const domain = createMenuDomain(createTheme('side'));
    domain.menuList.value = structuredClone(menuTree);

    domain.setSelectedKey('/dashboard/reports/detail');

    const titles = domain.breadcrumbs.value.map(b => b.title);
    expect(titles).toEqual(['仪表盘', '报表中心', '报表详情']);
  });

  it('returns empty breadcrumbs when no menu item matches the selected key', () => {
    const domain = createMenuDomain(createTheme('side'));
    domain.menuList.value = structuredClone(menuTree);

    domain.setSelectedKey('unknown-key');

    expect(domain.breadcrumbs.value).toEqual([]);
  });

  it('opens only direct parent keys when path is one level deep', () => {
    const domain = createMenuDomain(createTheme('side'));
    domain.menuList.value = structuredClone(menuTree);

    domain.setSelectedKey('/dashboard/reports');

    expect(domain.openKeys.value).toEqual(['dashboard']);
  });

  it('does not open any keys when selecting a root-level path', () => {
    const domain = createMenuDomain(createTheme('side'));
    domain.menuList.value = structuredClone(menuTree);

    domain.setSelectedKey('/dashboard');

    expect(domain.openKeys.value).toEqual([]);
  });

  it('toggles and resets menu state without affecting menu content', () => {
    const domain = createMenuDomain(createTheme('side'));
    domain.menuList.value = structuredClone(menuTree);

    domain.toggleOpenKey('dashboard');
    domain.openKey('reports');
    domain.setSiderCollapsed(true);
    domain.setSelectedKey('/dashboard/reports');

    expect(domain.openKeys.value).toEqual(['dashboard']);
    expect(domain.siderCollapsed.value).toBe(true);

    domain.resetMenuState();

    expect(domain.openKeys.value).toEqual([]);
    expect(domain.selectedKey.value).toBe('');
    expect(domain.siderCollapsed.value).toBe(false);
    expect(domain.menuList.value).toHaveLength(2);
  });
});
