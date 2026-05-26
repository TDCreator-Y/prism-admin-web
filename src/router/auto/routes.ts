import type { RouteRecordRaw } from 'vue-router';

// 手动配置的路由（禁用 auto-router）
export const autoRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'root',
    component: () => import('../../layouts/base-layout/index.vue'),
    redirect: '/home',
    meta: {
      hidden: true,
    },
    children: [
      {
        path: 'home',
        name: 'home',
        component: () => import('../../views/home.vue'),
        meta: {
          title: '首页',
          icon: 'fa-home',
        },
      },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('../../views/dashboard/index.vue'),
        meta: {
          title: 'UMD文件配置页面',
          icon: 'fa-chart-line',
        },
      },
      {
        path: 'umd-menu-config',
        name: 'umd-menu-config',
        component: () => import('../../views/umd-menu-config/index.vue'),
        meta: {
          title: 'UMD组件菜单配置',
          icon: 'fa-sliders-h',
        },
      },
      {
        path: 'server-info',
        name: 'server-info',
        component: () => import('../../views/server-info/index.vue'),
        meta: {
          title: '服务器信息',
          icon: 'fa-server',
        },
      },
      {
        path: 'blank',
        name: 'blank',
        component: () => import('../../views/blank.vue'),
        meta: {
          title: '暂无内容',
          hidden: true,
        },
      },
      {
        path: 'iframe-page',
        name: 'iframe-page',
        component: () => import('../../views/_builtin/iframe-page/index.vue'),
        meta: {
          title: 'Iframe 页面',
          hidden: true,
        },
        children: [
          {
            path: 'detail/:url(.*)',
            name: 'iframe-page-detail',
            component: () => import('../../views/_builtin/iframe-page/index.vue'),
            props: route => ({
              url: route.params.url as string,
              routeId: (route.query.routeId as string) || '',
              type: (route.query.type as string) || 'webview',
              routeQuery: route.query as Record<string, string>,
            }),
            meta: {
              title: 'Iframe 详情页',
              hidden: true,
              keepAlive: true,
            },
          },
        ],
      },
    ],
  },
  {
    path: '/404',
    name: 'page-not-found',
    component: () => import('../../views/404.vue'),
    meta: {
      hidden: true,
    },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
    meta: {
      hidden: true,
    },
  },
];

export default autoRoutes;
