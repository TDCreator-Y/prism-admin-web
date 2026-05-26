import { generateRoutes, transformRoutesToVueRoutes } from '@/router/routes/route-transform';
import type { ElegantRoute, MenuItem } from '@/router/routes/types';

describe('route-transform', () => {
  it('generates nested routes and default iframe children for folders with functions', () => {
    const menuTree: MenuItem[] = [
      {
        routeId: 'analytics',
        Title: '分析中心',
        DisplayName: '分析中心',
        Type: 'Folder',
        Icon: 'fa-chart-pie',
        Children: [
          {
            routeId: 'sales',
            Title: '销售分析',
            DisplayName: '销售分析',
            Type: 'Folder',
            FunctionId: 'sales-report',
            Children: [
              {
                routeId: 'daily',
                Title: '日报',
                Type: 'Page',
                FunctionId: 'sales-daily.vue',
              },
            ],
          },
        ],
      },
    ];

    const routes = generateRoutes(menuTree);

    expect(routes[0]).toMatchObject({
      name: 'analytics',
      path: '/analytics',
      component: 'layout.base',
    });

    expect(routes[0].children?.[0]).toMatchObject({
      name: 'analytics_sales',
      path: '/analytics/sales',
      component: 'layout.passthrough',
    });

    expect(routes[0].children?.[0].children?.[0]).toMatchObject({
      name: 'analytics_sales_default',
      path: '',
      component: 'view.iframe-page',
      props: expect.objectContaining({
        routeId: 'sales',
        functionId: 'sales-report',
        type: 'webview',
      }),
    });

    expect(routes[0].children?.[0].children?.[1]).toMatchObject({
      name: 'analytics_sales_daily',
      path: '/analytics/sales/daily',
      props: expect.objectContaining({
        routeId: 'daily',
        functionId: 'sales-daily.vue',
        type: 'vue',
      }),
    });
  });

  it('keeps system remarks as route paths when generating root and child routes', () => {
    const menuTree: MenuItem[] = [
      {
        routeId: 'systemRoot',
        Title: '系统管理',
        Type: 'System',
        Remark: '/system',
        Children: [
          {
            routeId: 'profile',
            Title: '个人中心',
            Type: 'System',
            Remark: 'profile',
            FunctionId: 'profile-page',
          },
        ],
      },
    ];

    const [rootRoute] = generateRoutes(menuTree);

    expect(rootRoute).toMatchObject({
      name: 'System',
      path: '/system',
    });
    expect(rootRoute.children?.[0]).toMatchObject({
      name: 'System_profile',
      path: '/profile',
      props: expect.objectContaining({
        url: 'profile',
        functionId: 'profile-page',
      }),
    });
  });

  it('transforms elegant routes to vue routes and keeps default-child redirect behavior', () => {
    const elegantRoutes: ElegantRoute[] = [
      {
        name: 'analytics',
        path: '/analytics',
        component: 'layout.base',
        children: [
          {
            name: 'analytics_default',
            path: '',
            component: 'view.iframe-page',
            meta: {
              title: '默认页',
            },
          },
        ],
      },
    ];

    const [vueRoute] = transformRoutesToVueRoutes(elegantRoutes);

    expect(vueRoute.path).toBe('/analytics');
    expect(typeof vueRoute.component).toBe('function');
    expect(vueRoute.redirect).toBe('');
    expect(Array.isArray(vueRoute.children)).toBe(true);
    expect(typeof vueRoute.children?.[0].component).toBe('function');
  });
});
