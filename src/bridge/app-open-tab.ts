/**
 * AppBridge OpenTab 自定义实现
 *
 * 用于统一管理 IframePage 三种渲染类型（webview、vue）的标签页打开功能
 */

import type { Router } from 'vue-router';
import router from '@/router';
import type { Pinia } from 'pinia';
import { useMenuStore } from '@/layouts/modules/global-menu/store';
import {
  findPathInfoByRouteId,
  isExternalUrl,
  openExternalUrl,
  openInternalPath,
  type OpenTabOptions,
} from './open-tab-core';
export type { OpenTabOptions } from './open-tab-core';

/**
 * AppOpenTab 自定义实现类
 *
 * 负责将 openTab 的调用转换为路由跳转和标签页管理
 */
export class AppOpenTab {
  public interfaceType = 'IOpenTab';
  private router: Router;
  private menuStore: ReturnType<typeof useMenuStore>;

  constructor(pinia?: Pinia) {
    this.router = router;
    this.menuStore = useMenuStore(pinia);
  }

  /**
   * 打开外部 URL 或内部路径
   * @param url - 完整的 URL 或内部路径
   * @param options - 打开选项
   */
  async open(url: string, options?: OpenTabOptions): Promise<boolean> {
    try {
      if (isExternalUrl(url)) {
        return openExternalUrl(url);
      }

      return this.openPath(url, options);
    } catch (error) {
      console.error('[AppBridge] 打开 URL 失败:', error);
      return false;
    }
  }

  /**
   * 打开内部路径
   * @param path - 内部路径（如 /dashboard、/analysis/overview）
   * @param options - 打开选项
   */
  async openPath(path: string, options?: OpenTabOptions): Promise<boolean> {
    try {
      return await openInternalPath({
        router: this.router,
        menuList: this.menuStore.menuList,
        addTab: tab => this.menuStore.addTab(tab),
        path,
      });
    } catch (error) {
      console.error('[AppBridge] 打开路径失败:', error);
      return false;
    }
  }

  /**
   * 打开功能模块（通过 routeId 打开）
   * @param routeId - 功能模块的 routeId
   * @param options - 打开选项
   */
  async openByRouteId(routeId: string, options?: OpenTabOptions): Promise<boolean> {
    try {
      const pathInfo = findPathInfoByRouteId(this.menuStore.menuList, routeId);

      if (!pathInfo || !pathInfo.path) {
        console.warn('[AppBridge] 未找到 routeId 对应的路径:', routeId);
        this.router.push('/');
        return false;
      }

      return this.openPath(pathInfo.path, options);
    } catch (error) {
      console.error('[AppBridge] 打开 routeId 失败:', error);
      return false;
    }
  }
}

/**
 * 快捷函数：打开 URL 或路径
 */
export function openTab(url: string, options?: OpenTabOptions): Promise<boolean> {
  if (typeof window !== 'undefined' && window.appBridge) {
    return window.appBridge.open(url, options);
  }
  // 如果 appBridge 未初始化，返回失败
  console.warn('[AppBridge] appBridge 未初始化');
  return Promise.resolve(false);
}

/**
 * 快捷函数：打开内部路径
 */
export function openTabPath(path: string, options?: OpenTabOptions): Promise<boolean> {
  return openTab(path, options);
}

/**
 * 快捷函数：通过 routeId 打开
 */
export function openTabByRouteId(routeId: string, options?: OpenTabOptions): Promise<boolean> {
  if (typeof window !== 'undefined' && window.appBridge?.openByRouteId) {
    return window.appBridge.openByRouteId(routeId, options);
  }
  console.warn('[AppBridge] appBridge 未初始化');
  return Promise.resolve(false);
}

