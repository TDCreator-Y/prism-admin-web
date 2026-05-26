import { ref } from 'vue';
import type { RouteRecordRaw } from 'vue-router';
import { autoRoutes } from '../auto/routes';
import { umdComponentsReady } from '@/utils/remote-component-state';
import { generateUmdRoutes } from '@/utils/remote-component-routes';
import { cacheDynamicRoutes, restoreDynamicRoutesFromCache } from './cache';
import { getMenuTree, getRootMenu } from './menu-tree';
import {
  generateRoutes,
  getStaticRoutes,
  transformRoutesToVueRoutes,
} from './route-transform';

// 路由生成状态
const isGenerating = ref(false);
const lastGeneratedAt = ref<number | null>(null);

// 完整的动态路由生成流程
export async function generateDynamicRoutes(): Promise<{
  constantRoutes: RouteRecordRaw[];
  authRoutes: RouteRecordRaw[];
}> {
  await umdComponentsReady;

  const umdVueRoutes = transformRoutesToVueRoutes(generateUmdRoutes());

  const cachedRoutes = restoreDynamicRoutesFromCache();
  if (cachedRoutes) {
    return {
      constantRoutes: getStaticRoutes(),
      authRoutes: [...autoRoutes, ...cachedRoutes, ...umdVueRoutes],
    };
  }

  const menuItems = await getRootMenu();
  const menuTree = getMenuTree(menuItems);
  const elegantRoutes = generateRoutes(menuTree);
  const vueRoutes = transformRoutesToVueRoutes(elegantRoutes);

  cacheDynamicRoutes(elegantRoutes);

  return {
    constantRoutes: getStaticRoutes(),
    authRoutes: [...autoRoutes, ...vueRoutes, ...umdVueRoutes],
  };
}

export function isRouteGenerating(): boolean {
  return isGenerating.value;
}

export function getLastGeneratedTime(): number | null {
  return lastGeneratedAt.value;
}

// 异步生成路由（不阻塞）
export async function asyncGenerateRoutes(): Promise<RouteRecordRaw[]> {
  if (isGenerating.value) {
    return [];
  }

  isGenerating.value = true;

  try {
    const result = await generateDynamicRoutes();
    lastGeneratedAt.value = Date.now();
    return result.authRoutes;
  } finally {
    isGenerating.value = false;
  }
}
