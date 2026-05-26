import {
  buildTabFromPathInfo,
  findPathInfo,
  findPathInfoByRouteId,
  getPageType,
  normalizePath,
  openInternalPath,
} from '@/bridge/open-tab-core';

describe('open-tab-core', () => {
  const menuTree = [
    {
      key: 'dashboard',
      path: '/dashboard',
      title: '仪表盘',
      icon: 'fa-home',
      routeId: 'dashboard',
      children: [
        {
          key: 'reports',
          path: '/dashboard/reports',
          DisplayName: '报表中心',
          Icon: 'fa-chart',
          RouteId: 'reports',
          FunctionId: '/reports/index.vue',
          children: [],
        },
      ],
    },
  ];

  it('normalizes paths by prefixing slash and removing query/hash', () => {
    expect(normalizePath('reports/index?tab=1#summary')).toBe('/reports/index');
  });

  it('detects page type from route payload', () => {
    expect(getPageType(menuTree[0].children![0] as never)).toBe('vue');
    expect(
      getPageType({
        key: 'webview',
        path: '/webview',
        title: '外链页面',
        url: 'https://example.com',
      } as never)
    ).toBe('webview');
  });

  it('finds nested menu items by path and routeId', () => {
    expect(findPathInfo(menuTree as never, '/dashboard/reports')).toMatchObject({
      key: 'reports',
      title: '报表中心',
      icon: 'fa-chart',
      routeId: 'reports',
      url: '/reports/index.vue',
      type: 'vue',
    });

    expect(findPathInfoByRouteId(menuTree as never, 'reports')).toMatchObject({
      key: 'reports',
      path: '/dashboard/reports',
    });
  });

  it('builds tabs from resolved path info with stable defaults', () => {
    expect(
      buildTabFromPathInfo({
        key: 'detail',
        path: '/detail',
      })
    ).toEqual({
      key: 'detail',
      path: '/detail',
      title: '未命名页面',
      icon: 'fa-file',
      children: [],
    });
  });

  it('opens normalized internal path and adds a tab when menu item exists', async () => {
    const push = vi.fn().mockResolvedValue(undefined);
    const addTab = vi.fn();

    const result = await openInternalPath({
      router: { push } as never,
      menuList: menuTree as never,
      addTab,
      path: 'dashboard/reports?tab=summary#anchor',
    });

    expect(result).toBe(true);
    expect(push).toHaveBeenCalledWith('/dashboard/reports');
    expect(addTab).toHaveBeenCalledWith(
      expect.objectContaining({
        key: 'reports',
        path: '/dashboard/reports',
        title: '报表中心',
        icon: 'fa-chart',
        meta: expect.objectContaining({
          routeId: 'reports',
          url: '/reports/index.vue',
          type: 'vue',
        }),
      })
    );
  });
});
