import type { RouteRecordRaw, Router } from 'vue-router';
import type { ElegantRoute, MenuItem } from './types';

// 获取菜单显示名称（优先使用 DisplayName，否则使用 Title）
function getMenuDisplayName(item: MenuItem): string {
  return item.DisplayName || item.Title;
}

// 生成根级路由
function generateRootRoute(item: MenuItem): ElegantRoute {
  const routeName = item.Type === 'System' ? item.Type : item.routeId;
  const routePath =
    item.Type === 'System'
      ? (item.Remark || `/${item.Type}`).startsWith('/')
        ? item.Remark || `/${item.Type}`
        : `/${item.Remark || item.Type}`
      : `/${item.routeId}`;

  return {
    name: routeName,
    path: routePath,
    component: 'layout.base',
    meta: {
      title: getMenuDisplayName(item),
      icon: item.Icon,
      order: item.Order,
      keepAlive: true,
    },
    children: [],
  };
}

// 生成子路由
function generateChildRoutes(
  items: MenuItem[],
  parentPath: string,
  parentName: string
): ElegantRoute[] {
  return items.map(item => {
    const isSystem = item.Type === 'System';
    const hasChildren = item.Children && item.Children.length > 0;
    const hasFunction = !!item.FunctionId;

    let routeName: string;
    if (isSystem && item.Remark) {
      const remarkPath = item.Remark.replace(/^\//, '');
      routeName = `${parentName}_${remarkPath.replace(/\//g, '_')}`;
    } else {
      routeName = `${parentName}_${item.routeId}`;
    }

    let routePath: string;
    if (isSystem && item.Remark) {
      routePath = item.Remark.startsWith('/') ? item.Remark : `/${item.Remark}`;
    } else {
      const normalizedParent = parentPath.replace(/\/$/, '');
      routePath = `${normalizedParent}/${item.routeId}`;
    }

    if (hasChildren) {
      const route: ElegantRoute = {
        name: routeName,
        path: routePath,
        component: 'layout.passthrough',
        meta: {
          title: getMenuDisplayName(item),
          icon: item.Icon,
          order: item.Order,
          keepAlive: true,
        },
        children: [],
      };

      route.children = generateChildRoutes(item.Children!, routePath, routeName);

      if (hasFunction) {
        route.children.unshift({
          name: `${routeName}_default`,
          path: '',
          component: 'view.iframe-page',
          props: {
            url: item.Type === 'System' ? item.Remark || '' : '',
            routeId: item.routeId,
            functionId: item.FunctionId,
            type: 'webview',
          },
          meta: {
            title: getMenuDisplayName(item),
            type: 'iframe',
            keepAlive: true,
          },
        });
      }

      return route;
    }

    return {
      name: routeName,
      path: routePath,
      component: 'view.iframe-page',
      props: {
        url: item.Type === 'System' ? item.Remark || '' : '',
        routeId: item.routeId,
        functionId: item.FunctionId || '',
        type: (item.FunctionId?.endsWith('.vue') ? 'vue' : 'webview') as 'webview' | 'vue',
      },
      meta: {
        title: getMenuDisplayName(item),
        icon: item.Icon,
        order: item.Order,
        type: 'iframe',
        keepAlive: true,
      },
    };
  });
}

// 生成路由树
export function generateRoutes(menuTree: MenuItem[]): ElegantRoute[] {
  return menuTree.map(item => {
    const route = generateRootRoute(item);

    if (item.Children && item.Children.length > 0) {
      route.children = generateChildRoutes(item.Children, route.path, route.name || item.routeId);
    }

    return route;
  });
}

// 定义组件路径映射
const layouts: Record<string, NonNullable<RouteRecordRaw['component']>> = {
  'layout.base': () => import('../../layouts/base-layout/index.vue'),
  'layout.passthrough': () => import('../../layouts/passthrough-layout/index.vue'),
};

const views: Record<string, NonNullable<RouteRecordRaw['component']>> = {
  'view.iframe-page': () => import('../../views/_builtin/iframe-page/index.vue'),
  'view.umd-component': () => import('../../views/_builtin/umd-component/index.vue'),
};

// 将 Elegant 路由转换为 Vue Router 路由
function transformElegantRouteToVueRoute(route: ElegantRoute): RouteRecordRaw {
  if (route.redirect && !route.component) {
    return {
      path: route.path,
      redirect: route.redirect,
      name: route.name,
      meta: route.meta,
    } as RouteRecordRaw;
  }

  const vueRoute = {
    name: route.name,
    path: route.path,
    meta: route.meta,
    props: route.props,
  } as RouteRecordRaw;

  if (route.component) {
    if (route.component.startsWith('layout.')) {
      const layoutName = route.component.replace('layout.', '');
      vueRoute.component = layouts[`layout.${layoutName}`] || layouts['layout.base'];
    } else if (route.component.startsWith('view.')) {
      const viewName = route.component.replace('view.', '');
      const viewKey = `view.${viewName}`;
      vueRoute.component = views[viewKey] || views['view.iframe-page'];
    } else {
      vueRoute.component = () => import(`../../views/${route.component}.vue`);
    }
  }

  if (route.children && route.children.length > 0) {
    vueRoute.children = route.children.map((child: ElegantRoute) =>
      transformElegantRouteToVueRoute(child)
    );

    if (route.children[0]?.path === '') {
      vueRoute.redirect = route.redirect || '';
    }
  }

  if (route.redirect && !vueRoute.redirect) {
    vueRoute.redirect = route.redirect;
  }

  return vueRoute;
}

// 转换所有路由
export function transformRoutesToVueRoutes(routes: ElegantRoute[]): RouteRecordRaw[] {
  return routes.map(route => transformElegantRouteToVueRoute(route));
}

// 导出函数用于递归添加路由
export function addRouteWithChildren(
  router: Pick<Router, 'addRoute'>,
  routes: RouteRecordRaw[],
  parentName?: string
) {
  if (!routes || !Array.isArray(routes)) {
    console.warn('[Router] 无效的路由数组:', routes);
    return;
  }

  routes.forEach((route, index) => {
    if (!route) {
      console.warn('[Router] 无效的路由，跳过索引:', index);
      return;
    }

    if (route.path === undefined) {
      console.warn('[Router] 路由缺少 path 属性，跳过:', route.name, 'parent:', parentName);
      return;
    }

    try {
      if (parentName) {
        router.addRoute(parentName, route);
      } else {
        router.addRoute(route);
      }
    } catch (e) {
      console.error('[Router] 添加路由失败:', route, e);
      return;
    }

    if (route.children && route.children.length > 0) {
      if (!route.name) {
        console.warn('[Router] 父路由缺少 name 属性，无法添加子路由:', route.path);
        return;
      }

      const parent = typeof route.name === 'string' ? route.name : undefined;
      addRouteWithChildren(router, route.children, parent);
    }
  });
}

// 获取静态路由（404等）
export function getStaticRoutes(): RouteRecordRaw[] {
  return [
    {
      path: '/404',
      name: 'page-not-found',
      component: () => import('../../views/404.vue'),
      meta: { hidden: true },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/404',
      meta: { hidden: true },
    },
  ];
}

export { layouts, views };
