<script setup lang="ts">
  defineOptions({ name: 'IframePage' });
  import { ref, onMounted, onUnmounted, onActivated, computed, watch, defineAsyncComponent } from 'vue';
  import { useRoute } from 'vue-router';
  import { useEventBus } from '@vueuse/core';
  import {
    useTeleportManager,
    generatePageId,
    type PageType,
  } from '@/store/modules/teleport-manager';
  import WebviewComponent from './webview.vue';
  import { useCancellableRequest } from '@/composables/useCancellableRequest';
  const VueComponent = defineAsyncComponent(() => import('./vueComponent.vue'));
  // [MOCK MODE] 已注释掉后端请求依赖
  // import { bridgeClient } from '@/services/bridge-client';

  // 路由 props
  const props = defineProps<{
    url: string;
    routeId?: string;
    functionId?: string;
    type?: PageType;
    routeQuery?: Record<string, string>;
    backendOrigin?: string;
  }>();

  const route = useRoute();
  const { registerPage, unregisterPage, updatePageStatus, requestActivation, forceActivate } =
    useTeleportManager();

  const { newSignal, cancel: cancelFetch } = useCancellableRequest();
  const pageId = ref<string>('');
  const cleanupCallbacks = ref<(() => void)[]>([]);
  let offTabClose: (() => void) | null = null;

  // 动态渲染类型（由接口决定）
  const dynamicRenderType = ref<PageType>('webview');
  const dynamicHandler = ref<string>('');
  const isLoading = ref(true);

  // 最终渲染类型（优先使用动态类型，否则使用 props.type）
  const renderType = computed((): PageType => {
    if (dynamicRenderType.value !== 'webview') {
      return dynamicRenderType.value;
    }
    const type = props.type?.toLowerCase() as PageType;
    if (type === 'vue') {
      return type;
    }
    // 如果 URL 以 .vue 结尾，识别为 Vue 组件
    if (props.url?.endsWith('.vue') || props.functionId?.endsWith('.vue')) {
      return 'vue';
    }
    return 'webview';
  });

  // 最终 URL（优先使用动态 Handler，否则使用 props.url）
  const renderUrl = computed(() => {
    if (dynamicHandler.value) {
      return dynamicHandler.value;
    }
    return props.url || '';
  });

  // 是否为自定义路由场景
  const isCustomRoute = computed(() => {
    const path = route.path;
    return path.startsWith('/custom_') || path.startsWith('/bridge_');
  });

  // 获取后端 origin
  const backendOrigin = computed(() => {
    return props.backendOrigin || '';
  });

  // 获取功能访问权限并决定渲染方式
  // signal 参数供 AbortController 取消使用；真实后端请求恢复时透传给 http.get()
  async function fetchFunctionAccess(signal?: AbortSignal) {
    if (!props.routeId) {
      isLoading.value = false;
      return;
    }

    if (signal?.aborted) return;

    // [MOCK MODE] 返回同源演示页面，后续在 webview 落点统一执行 iframe 安全校验
    // 恢复后端连接时，注释掉下面的 mock 逻辑，取消注释下方原始请求代码
    dynamicHandler.value = `${window.location.origin}/e2e/mock-iframe.html`;
    dynamicRenderType.value = 'webview';
    isLoading.value = false;
    return;

    // ── 原始后端请求（恢复时取消注释，使用 http.get 以自动携带 credentials）──
    // try {
    //   const data = await http.get<any>(
    //     `/api/functions/access.json?menuRouteIds=${props.routeId}`,
    //     { signal }
    //   );
    //   const config = getGlobalConfig();
    //   let origin = config.Origin || '';
    //   if (!origin && config.UseWindowOrigin) origin = window.location.origin;
    //   if (data?.Results?.length > 0) {
    //     const handler = data.Results[0].Handler;
    //     if (handler) {
    //       dynamicHandler.value = handler.startsWith('http') ? handler : origin + handler;
    //       dynamicRenderType.value = handler.endsWith('.vue') ? 'vue' : 'webview';
    //     }
    //   }
    // } catch (error) {
    //   if (error instanceof Error && error.name === 'AbortError') return;
    //   console.error('[IframePage] 获取功能权限失败:', error);
    // } finally {
    //   isLoading.value = false;
    // }
  }

  // 生成页面实例 ID
  function initPageId() {
    const url = renderUrl.value || (route.params.url as string) || '';
    const routeId = props.routeId || (route.query.routeId as string) || '';
    pageId.value = generatePageId(url, routeId, renderType.value);
  }

  // 注册页面
  function registerCurrentPage() {
    initPageId();
    registerPage(pageId.value, renderType.value, renderUrl.value, props.routeId);
    updatePageStatus(pageId.value, 'pending');
  }

  // 处理自定义路由参数
  function handleCustomRouteParams() {
    if (isCustomRoute.value && renderType.value === 'vue') {
      const routeQuery = props.routeQuery;
      if (routeQuery) {
        if (!window.customRouteParamsManager) {
          window.customRouteParamsManager = {};
        }
        window.customRouteParamsManager[route.fullPath] = {
          params: routeQuery,
          routeId: pageId.value,
          timestamp: Date.now(),
        };
        window.currentCustomRouteKey = route.fullPath;
      }
    }
  }

  // 选择渲染组件
  const CurrentComponent = computed(() => {
    return renderType.value === 'vue' ? VueComponent : WebviewComponent;
  });

  // 组件就绪回调
  function handleComponentReady() {
    requestActivation(pageId.value);
  }

  // 组件清理回调
  function handleComponentCleanup() {
    if (isCustomRoute.value && window.customRouteParamsManager) {
      delete window.customRouteParamsManager[route.fullPath];
    }
  }

  // 清理所有资源
  function cleanupAll() {
    cleanupCallbacks.value.forEach(cb => {
      try {
        cb();
      } catch (error) {
        console.debug('[IframePage] cleanup callback failed:', error);
      }
    });
    cleanupCallbacks.value = [];

    if (pageId.value) {
      unregisterPage(pageId.value);
    }
  }

  // 监听标签关闭事件
  const tabCloseBus = useEventBus<string>('tab-close');
  onMounted(async () => {
    const signal = newSignal();
    await fetchFunctionAccess(signal);
    if (signal.aborted) return;

    registerCurrentPage();
    handleCustomRouteParams();

    // 监听标签关闭
    offTabClose = tabCloseBus.on(closedPath => {
      if (closedPath === route.path && pageId.value) {
        cleanupAll();
      }
    });
  });

  // 激活时更新状态
  onActivated(() => {
    if (pageId.value) {
      forceActivate(pageId.value);
    }
  });

  onUnmounted(() => {
    cancelFetch();
    if (offTabClose) {
      offTabClose();
      offTabClose = null;
    }
    cleanupAll();
  });

  // props 变化时取消前一个请求再重新发起，防止竞态覆盖
  watch(
    () => [props.url, props.routeId, props.type],
    async () => {
      const signal = newSignal();
      isLoading.value = true;
      dynamicHandler.value = '';
      dynamicRenderType.value = 'webview';

      await fetchFunctionAccess(signal);
      if (signal.aborted) return;

      cleanupAll();
      registerCurrentPage();
      handleCustomRouteParams();
    }
  );
</script>

<template>
  <div class="iframe-page-entry">
    <!-- 加载中状态 -->
    <div
      v-if="isLoading"
      class="loading-state"
    >
      <i class="fas fa-spinner fa-spin" />
      <span>加载中...</span>
    </div>

    <!-- 渲染组件 -->
    <component
      v-else
      :is="CurrentComponent"
      ref="currentComponent"
      :url="renderUrl"
      :route-id="routeId"
      :function-id="functionId"
      :page-id="pageId"
      :route-query="routeQuery"
      :backend-origin="backendOrigin"
      @ready="handleComponentReady"
      @cleanup="handleComponentCleanup"
    />
  </div>
</template>

<style scoped>
  .iframe-page-entry {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    color: #909399;
    font-size: 14px;
    gap: 12px;
  }

  .loading-state i {
    font-size: 24px;
  }
</style>
