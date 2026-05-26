import { defineStore } from 'pinia';
import { ref, computed, type Component } from 'vue';

export type PageType = 'webview' | 'vue';

export interface PageInfo {
  id: string;
  type: PageType;
  url: string;
  routeId?: string;
  status: 'pending' | 'loading' | 'ready' | 'active' | 'hidden';
  createdAt: number;
  activatedAt?: number;
}

export interface TeleportManagerState {
  pages: Map<string, PageInfo>;
  activePageId: string | null;
  activationQueue: Map<string, number>;
  activationLock: boolean;
  vueComponentCache: Map<string, CachedVueComponent>;
  vueComponentLoading: Map<string, Promise<Component>>;
}

export interface CachedVueComponent {
  component: Component;
  styles?: HTMLStyleElement[];
}

// 生成唯一页面实例 ID
export function generatePageId(url: string, routeId: string, type: PageType): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const encodedUrl = encodeURIComponent(url.slice(0, 50));
  return `${type}_${encodedUrl}_${routeId || 'default'}_${timestamp}_${random}`;
}

// 生成 Vue 组件缓存键（用于 keep-alive 保持组件状态）
export function generateComponentCacheKey(
  url: string,
  routeId: string,
  backendOrigin?: string
): string {
  const origin = backendOrigin || '';
  const fullUrl = url.startsWith('http') ? url : `${origin}${url}`;
  return `vue_component::${fullUrl}::${routeId || ''}`;
}

export const useTeleportManager = defineStore('teleport-manager', () => {
  const pages = ref<Map<string, PageInfo>>(new Map());
  const activePageId = ref<string | null>(null);
  const activationQueue = ref<Map<string, number>>(new Map());
  const activationLock = ref(false);

  // Vue 组件全局缓存（用于 keep-alive 保持组件状态）
  const vueComponentCache = ref<Map<string, CachedVueComponent>>(new Map());
  const vueComponentLoading = ref<Map<string, Promise<Component>>>(new Map());

  // 防抖激活请求
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const allPages = computed(() => Array.from(pages.value.values()));

  const activePage = computed(() => {
    if (!activePageId.value) return null;
    return pages.value.get(activePageId.value) || null;
  });

  const visiblePages = computed(() => {
    if (!activePageId.value) return [];
    return allPages.value.filter(p => p.status === 'active' || p.id === activePageId.value);
  });

  // Vue 组件缓存操作
  function getVueComponent(cacheKey: string): CachedVueComponent | undefined {
    return vueComponentCache.value.get(cacheKey);
  }

  function setVueComponent(cacheKey: string, component: CachedVueComponent): void {
    vueComponentCache.value.set(cacheKey, component);
  }

  function hasVueComponent(cacheKey: string): boolean {
    return vueComponentCache.value.has(cacheKey);
  }

  function getVueComponentLoading(cacheKey: string): Promise<Component> | undefined {
    return vueComponentLoading.value.get(cacheKey);
  }

  function setVueComponentLoading(cacheKey: string, promise: Promise<Component>): void {
    vueComponentLoading.value.set(cacheKey, promise);
  }

  function deleteVueComponentLoading(cacheKey: string): void {
    vueComponentLoading.value.delete(cacheKey);
  }

  function clearVueComponentCache(): void {
    vueComponentCache.value.clear();
    vueComponentLoading.value.clear();
  }

  // 根据路径和 routeId 移除组件缓存
  function removeComponentCacheByPath(path: string, routeId?: string): void {
    // 遍历缓存，找到匹配的项并删除
    const keysToDelete: string[] = [];
    const targetRouteId = routeId || '';

    vueComponentCache.value.forEach((_, key) => {
      // 缓存键格式: vue_component::${fullUrl}::${routeId || ''}
      // 需要匹配路径部分
      if (key.startsWith('vue_component::')) {
        const urlPart = key.replace('vue_component::', '');

        const lastSep = urlPart.lastIndexOf('::');
        const fullUrl = lastSep > -1 ? urlPart.substring(0, lastSep) : urlPart;
        const keyRouteId = lastSep > -1 ? urlPart.substring(lastSep + 2) : '';

        // 检查 routeId 是否匹配
        let isMatch = false;

        // 策略1: 如果传入了 targetRouteId，且与缓存的 keyRouteId 相等，并且路径或 URL 匹配
        if (targetRouteId && keyRouteId === targetRouteId) {
          if (
            path.includes(fullUrl) ||
            path.includes(encodeURIComponent(fullUrl)) ||
            fullUrl.includes(path)
          ) {
            isMatch = true;
          }
        }

        // 策略2: 如果路径中直接包含缓存的 routeId (处理 routeId 未传入但存在于路径中的情况)
        // 确保 keyRouteId 有一定长度，避免误匹配短字符串
        if (!isMatch && keyRouteId && keyRouteId.length > 8 && path.includes(keyRouteId)) {
          isMatch = true;
        }

        if (isMatch) {
          keysToDelete.push(key);
        }
      }
    });

    keysToDelete.forEach(key => {
      // Clean up styles if any (防止内存泄漏)
      const cached = vueComponentCache.value.get(key);
      if (cached && Array.isArray(cached.styles)) {
        cached.styles.forEach(style => {
          if (style && style.parentNode) {
            style.parentNode.removeChild(style);
          }
        });
      }

      vueComponentCache.value.delete(key);

      // Also clear loading state if exists
      if (vueComponentLoading.value.has(key)) {
        vueComponentLoading.value.delete(key);
      }
    });
  }

  function registerPage(id: string, type: PageType, url: string, routeId?: string): void {
    const page: PageInfo = {
      id,
      type,
      url,
      routeId,
      status: 'pending',
      createdAt: Date.now(),
    };
    pages.value.set(id, page);
  }

  function unregisterPage(id: string): void {
    pages.value.delete(id);
    activationQueue.value.delete(id);
    if (activePageId.value === id) {
      activePageId.value = null;
    }
  }

  function getPage(id: string): PageInfo | undefined {
    return pages.value.get(id);
  }

  function updatePageStatus(id: string, status: PageInfo['status']): void {
    const page = pages.value.get(id);
    if (page) {
      page.status = status;
      if (status === 'active') {
        page.activatedAt = Date.now();
        activePageId.value = id;
      }
    }
  }

  function requestActivation(id: string): void {
    // 添加到队列
    const count = activationQueue.value.get(id) || 0;
    activationQueue.value.set(id, count + 1);

    // 清除之前的防抖定时器
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // 防抖执行
    debounceTimer = setTimeout(() => {
      performActivation();
    }, 50);
  }

  function debouncedRequestActivation(id: string): void {
    requestActivation(id);
  }

  function performActivation(): void {
    if (activationLock.value) return;

    // 找到队列中请求次数最多的页面
    let maxCount = 0;
    let targetId: string | null = null;

    activationQueue.value.forEach((count, id) => {
      const page = pages.value.get(id);
      if (page && count > maxCount) {
        maxCount = count;
        targetId = id;
      }
    });

    if (targetId && maxCount > 0) {
      activationLock.value = true;

      // 将所有页面设置为 hidden
      pages.value.forEach((page, id) => {
        if (id !== targetId) {
          page.status = 'hidden';
        }
      });

      // 激活目标页面
      const targetPage = pages.value.get(targetId!);
      if (targetPage) {
        targetPage.status = 'active';
        targetPage.activatedAt = Date.now();
        activePageId.value = targetId;
      }

      // 清除队列
      activationQueue.value.clear();
      activationLock.value = false;
    }
  }

  // 强制立即激活（跳过防抖队列），用于 Tab 切换等明确的用户交互
  function forceActivate(id: string): void {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
    activationQueue.value.clear();

    // 更新状态
    pages.value.forEach((page, pid) => {
      if (pid !== id) {
        page.status = 'hidden';
      }
    });

    const targetPage = pages.value.get(id);
    if (targetPage) {
      targetPage.status = 'active';
      targetPage.activatedAt = Date.now();
      activePageId.value = id;
    }
  }

  // 隐藏所有页面（用于切换到非动态路由时）
  function hideAllPages(): void {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
    activationQueue.value.clear();

    pages.value.forEach(page => {
      page.status = 'hidden';
    });
    activePageId.value = null;
  }

  function shouldShowPage(id: string): boolean {
    const page = pages.value.get(id);
    if (!page) return false; // 未注册的页面默认不显示（防止残留组件显示）
    // 显示：pending(等待中)、loading(加载中)、ready(就绪)、active(激活中)
    // 不显示：hidden(已隐藏)
    return page.status !== 'hidden';
  }

  function getActivePage(): PageInfo | null {
    return activePage.value;
  }

  function cleanup(): void {
    pages.value.clear();
    activationQueue.value.clear();
    activePageId.value = null;
    activationLock.value = false;
    // 不清除组件缓存（保持状态）
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
  }

  return {
    pages,
    activePageId,
    allPages,
    activePage,
    visiblePages,
    activationLock,
    vueComponentCache,
    vueComponentLoading,
    registerPage,
    unregisterPage,
    getPage,
    updatePageStatus,
    requestActivation,
    debouncedRequestActivation,
    forceActivate,
    hideAllPages,
    shouldShowPage,
    getActivePage,
    getVueComponent,
    setVueComponent,
    hasVueComponent,
    getVueComponentLoading,
    setVueComponentLoading,
    deleteVueComponentLoading,
    clearVueComponentCache,
    removeComponentCacheByPath,
    cleanup,
  };
});
