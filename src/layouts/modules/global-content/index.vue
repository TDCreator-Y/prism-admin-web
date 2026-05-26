<script setup lang="ts">
  import { computed, h, watch, type Component } from 'vue';
  import { useRoute } from 'vue-router';
  import { useMenuStore } from '../global-menu/store';
  import { useTeleportManager } from '@/store/modules/teleport-manager';

  const props = withDefaults(
    defineProps<{
      showTabs?: boolean;
      keepAlive?: boolean;
    }>(),
    {
      showTabs: true,
      keepAlive: true,
    }
  );

  const menuStore = useMenuStore();
  const teleportManager = useTeleportManager();
  const route = useRoute();

  // 监听路由变化，非动态组件路由时隐藏所有动态组件
  watch(
    () => route.name,
    newName => {
      const name = String(newName || '');
      // 如果不是 iframe-page 相关路由，隐藏所有动态组件
      if (!name.startsWith('iframe-page')) {
        teleportManager.hideAllPages();
      }
    },
    { immediate: true }
  );

  // 检查是否为动态路由（需要禁用 keep-alive）
  const isDynamicRoute = computed(() => {
    const path = route.path;
    const name = String(route.name || '');
    // iframe / 自定义动态页通常承载重型 DOM、iframe 或远程组件，继续保活会显著抬高内存占用
    return (
      path.startsWith('/custom_') ||
      path.startsWith('/bridge_') ||
      name.startsWith('iframe-page')
    );
  });

  // 是否应该使用 keep-alive（动态路由不使用）
  const shouldKeepAlive = computed(() => {
    return props.keepAlive && !isDynamicRoute.value;
  });

  // 缓存的组件列表（使用路由名称作为缓存 key）
  const cachedViews = computed(() => {
    // KeepAlive include 匹配的是组件的 name 属性
    // 我们将使用包装组件，将其 name 设置为路由的 name
    const views = menuStore.tabsList
      .map(tab => tab.key) // tab.key 通常存储路由的 name
      .filter((key): key is string => !!key);

    return views;
  });

  const showTabs = computed(() => props.showTabs && menuStore.theme.showTabs);

  // 判断是否需要全宽布局（带内边距的页面）
  const isFullWidthLayout = computed(() => {
    return ['home', 'dashboard', 'umd-menu-config'].includes(String(route.name));
  });

  // 缓存包装组件定义，避免重复创建导致组件重置
  const wrapperMap = new Map<string, Component>();

  function getWrappedComponentName(component: Component): string | undefined {
    if (typeof component !== 'object' || component === null) {
      return undefined;
    }

    const candidate = component as { type?: { name?: string } };
    return candidate.type?.name;
  }

  // 监听 cachedViews 变化，清理不再使用的 wrapper 缓存
  watch(
    cachedViews,
    views => {
      const viewSet = new Set(views);
      for (const key of wrapperMap.keys()) {
        if (!viewSet.has(key)) {
          wrapperMap.delete(key);
        }
      }
    }
  );

  // 包装组件函数：动态设置组件名称以匹配路由名称，从而使 keep-alive 生效
  const wrapComponent = (component: Component | null | undefined, routeName: string) => {
    if (!component) return component;

    // 如果组件已经有了正确的名称，直接返回
    if (getWrappedComponentName(component) === routeName) {
      return component;
    }

    // 检查缓存
    if (wrapperMap.has(routeName)) {
      return wrapperMap.get(routeName);
    }

    // 创建一个包装组件
    const wrapper = {
      name: routeName, // 关键：设置组件名称与 cachedViews 中的名称一致
      render() {
        return h(component);
      },
    };

    wrapperMap.set(routeName, wrapper);
    return wrapper;
  };
</script>

<template>
  <main class="flex-1 flex flex-col min-h-0 bg-transparent dark:bg-transparent">
    <!-- 面包屑和标签页同一行 -->
    <div
      class="flex items-center bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 md:px-6 h-10 transition-colors duration-300"
    >
      <!-- 标签页 -->
      <GlobalTab
        v-if="showTabs"
        class="flex-1 min-w-0"
      />
      <!-- 面包屑 -->
      <div class="flex items-center flex-shrink-0 ml-4 overflow-hidden">
        <GlobalBreadcrumb v-if="menuStore.theme.showBreadcrumb" />
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="flex-1 overflow-y-auto p-0 relative">
      <div
        :class="[
          'min-h-full relative',
          isFullWidthLayout ? 'w-full px-4 md:px-6 py-6' : 'mx-auto',
        ]"
      >
        <template v-if="shouldKeepAlive">
          <router-view v-slot="{ Component, route }">
            <transition
              enter-active-class="tab-enter-active"
              enter-from-class="tab-enter-from"
              enter-to-class="tab-enter-to"
              leave-active-class="tab-leave-active"
              leave-from-class="tab-leave-from"
              leave-to-class="tab-leave-to"
            >
              <keep-alive :include="cachedViews">
                <component
                  :is="wrapComponent(Component, route.name as string)"
                  :key="route.fullPath"
                />
              </keep-alive>
            </transition>
          </router-view>
        </template>

        <template v-else>
          <router-view v-slot="{ Component, route }">
            <transition
              enter-active-class="tab-enter-active"
              enter-from-class="tab-enter-from"
              enter-to-class="tab-enter-to"
              leave-active-class="tab-leave-active"
              leave-from-class="tab-leave-from"
              leave-to-class="tab-leave-to"
            >
              <component
                :is="Component"
                :key="route.fullPath"
              />
            </transition>
          </router-view>
        </template>
      </div>

      <!-- Iframe 挂载点 -->
      <div
        id="teleport-root"
        style="
          width: 100%;
          height: 100%;
          position: absolute;
          top: 0;
          left: 0;
          pointer-events: none;
          z-index: 100;
        "
      ></div>
    </div>
  </main>
</template>

<style scoped>
/*
 * 内容区标签切换过渡：纯 opacity 淡入淡出
 * - 不使用 translateY，避免 layout 触发和视觉抖动
 * - will-change: opacity 让浏览器提前将元素提升为合成层（GPU），切换更顺滑
 * - enter/leave 同时进行（交叉淡化），无等待延迟
 */
.tab-enter-active {
  transition: opacity 160ms ease-out;
  will-change: opacity;
}

.tab-leave-active {
  transition: opacity 100ms ease-in;
  will-change: opacity;
  /* 脱离文档流，让新页面同时淡入，不占位 */
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}

.tab-enter-from {
  opacity: 0;
}

.tab-enter-to {
  opacity: 1;
}

.tab-leave-from {
  opacity: 1;
}

.tab-leave-to {
  opacity: 0;
}
</style>
