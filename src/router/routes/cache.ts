import type { RouteRecordRaw } from 'vue-router';
import type { CachedRoutes, ElegantRoute } from './types';
import { getGlobalConfig } from './global-config';
import { transformRoutesToVueRoutes } from './route-transform';

const CACHE_KEY = 'DYNAMIC_ROUTES_CACHE';
const CACHE_VERSION = 'v5';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

// 缓存路由（直接存储 ElegantRoute 格式，避免反向序列化在生产构建中因代码压缩而丢失组件映射）
export function cacheDynamicRoutes(routes: ElegantRoute[]): void {
  try {
    const globalConfig = getGlobalConfig();
    const cacheData: CachedRoutes & { version?: string } = {
      routes,
      timestamp: Date.now(),
      userCode: globalConfig.UserCode || '',
      internalCode: globalConfig.InternalCode,
      version: CACHE_VERSION,
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (e) {
    console.warn('缓存路由失败:', e);
  }
}

// 清除缓存
export function clearDynamicRoutesCache(): void {
  localStorage.removeItem(CACHE_KEY);
}

// 从缓存恢复（返回已转换的 Vue Router 格式）
export function restoreDynamicRoutesFromCache(): RouteRecordRaw[] | null {
  try {
    const cacheStr = localStorage.getItem(CACHE_KEY);
    if (!cacheStr) return null;

    const cacheData: CachedRoutes & { version?: string } = JSON.parse(cacheStr);
    const globalConfig = getGlobalConfig();

    if (cacheData.version !== CACHE_VERSION) {
      clearDynamicRoutesCache();
      return null;
    }

    const isExpired = Date.now() - cacheData.timestamp > CACHE_EXPIRY;
    if (isExpired) {
      clearDynamicRoutesCache();
      return null;
    }

    if (cacheData.userCode !== globalConfig.UserCode) {
      return null;
    }

    if (cacheData.internalCode !== globalConfig.InternalCode) {
      return null;
    }

    const validateRoutes = (routes: unknown[]): ElegantRoute[] | null => {
      if (!Array.isArray(routes)) return null;

      const validRoutes: ElegantRoute[] = [];

      for (const route of routes) {
        if (!isRecord(route)) {
          console.warn('[DynamicRoutes] 无效的路由对象，跳过');
          continue;
        }

        if (route.path === undefined) {
          console.warn('[DynamicRoutes] 路由缺少 path 属性，跳过:', route.name);
          continue;
        }

        const normalizedRoute = route as unknown as ElegantRoute;
        const childRoutes = route.children;

        if (Array.isArray(childRoutes)) {
          const validChildren = validateRoutes(childRoutes);
          if (validChildren) {
            normalizedRoute.children = validChildren;
          } else {
            delete normalizedRoute.children;
          }
        }

        validRoutes.push(normalizedRoute);
      }

      return validRoutes.length > 0 ? validRoutes : null;
    };

    const validRoutes = validateRoutes(cacheData.routes);
    if (!validRoutes) {
      console.warn('[DynamicRoutes] 缓存路由无效，清除缓存');
      clearDynamicRoutesCache();
      return null;
    }

    return transformRoutesToVueRoutes(validRoutes);
  } catch (e) {
    console.warn('恢复缓存路由失败:', e);
    return null;
  }
}
