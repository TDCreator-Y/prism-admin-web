/**
 * AppBridge OpenTab Composable
 *
 * 统一管理标签页打开功能，支持：
 * - 外部 URL：使用 window.open
 * - 内部路径：通过 appBridge.open 或 router.push
 */

import { useRouter } from 'vue-router'
import { useMenuStore } from '@/layouts/modules/global-menu/store'
import type { MenuItem } from '@/layouts/modules/global-menu/types'
import {
  findPathInfo,
  findPathInfoByRouteId,
  isAppBridgeAvailable,
  isExternalUrl,
  openExternalUrl,
  openInternalPath,
  type OpenTabOptions,
  type PathInfo,
} from '@/bridge/open-tab-core'
export type { OpenTabOptions } from '@/bridge/open-tab-core'

/**
 * 使用 AppBridge OpenTab
 */
export function useAppOpenTab() {
  const router = useRouter()
  const menuStore = useMenuStore()

  /**
   * 打开 URL 或路径
   */
  async function openTab(url: string, options?: OpenTabOptions): Promise<boolean> {
    try {
      if (isExternalUrl(url)) {
        return openExternalUrl(url)
      }

      return openPath(url, options)
    } catch (error) {
      console.error('[useAppOpenTab] 打开失败:', error)
      return false
    }
  }

  /**
   * 打开内部路径
   */
  async function openPath(path: string, options?: OpenTabOptions): Promise<boolean> {
    try {
      const normalizedPath = path
      if (isAppBridgeAvailable() && window.appBridge) {
        const result = await window.appBridge.open(normalizedPath, options)
        if (result) {
          return true
        }
      }

      return await openInternalPath({
        router,
        menuList: menuStore.menuList,
        addTab: tab => menuStore.addTab(tab),
        path,
      })
    } catch (error) {
      console.error('[useAppOpenTab] 打开路径失败:', error)
      return false
    }
  }

  /**
   * 通过 routeId 打开
   */
  async function openByRouteId(routeId: string, options?: OpenTabOptions): Promise<boolean> {
    try {
      const pathInfo = findPathInfoByRouteId(menuStore.menuList, routeId)

      if (!pathInfo?.path) {
        console.warn('[useAppOpenTab] 未找到 routeId 对应的路径:', routeId)
        return false
      }

      return openPath(pathInfo.path, options)
    } catch (error) {
      console.error('[useAppOpenTab] 打开 routeId 失败:', error)
      return false
    }
  }

  /**
   * 打开菜单项
   */
  async function openMenuItem(item: MenuItem, options?: OpenTabOptions): Promise<boolean> {
    if (!item.path) {
      console.warn('[useAppOpenTab] 菜单项缺少 path:', item)
      return false
    }
    return openPath(item.path, options)
  }

  return {
    openTab,
    openPath,
    openByRouteId,
    openMenuItem,
    findPathInfo: (path: string): PathInfo | null => findPathInfo(menuStore.menuList, path),
    findPathInfoByRouteId: (routeId: string): PathInfo | null =>
      findPathInfoByRouteId(menuStore.menuList, routeId),
  }
}
