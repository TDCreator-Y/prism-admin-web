<script setup lang="ts">
  import { computed, ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useMenuStore } from '../global-menu/store';
  import type { MenuItem } from '../global-menu/types';
  import { useAppOpenTab } from '@/composables/useAppOpenTab';

  const menuStore = useMenuStore();
  const route = useRoute();
  const router = useRouter();
  const { openPath } = useAppOpenTab();

  // 标签页列表 - 按添加顺序从左往右排列
  const tabsList = computed(() => menuStore.tabsList);

  // 激活的标签
  const activeTab = computed(() => route.path);

  // 容器引用
  const containerRef = ref<HTMLElement | null>(null);
  // 各标签 DOM 引用 map（path -> el），用于精确滚动，避免 querySelector 强制重排
  const tabElMap = new Map<string, HTMLElement>();
  function setTabRef(el: HTMLElement | null, path: string) {
    if (el) tabElMap.set(path, el);
    else tabElMap.delete(path);
  }

  // 关闭标签
  async function closeTab(path: string, e: Event) {
    e.stopPropagation();
    const index = menuStore.tabsList.findIndex(t => t.path === path);
    if (index > -1) {
      const wasActive = path === activeTab.value;
      await menuStore.removeTab(path);

      // 如果列表为空，跳转到空白页
      if (menuStore.tabsList.length === 0) {
        router.push('/blank');
        return;
      }

      // 如果关闭的是当前激活的标签，跳转到最后一个标签
      if (wasActive) {
        const lastTab = menuStore.tabsList[menuStore.tabsList.length - 1];
        openPath(lastTab.path);
      }
    }
  }

  // 拖拽滚动相关
  const isDragging = ref(false);
  const startX = ref(0);
  const scrollLeft = ref(0);

  // 自动滚动到当前激活的标签
  function scrollToActiveTab() {
    if (!containerRef.value) return;

    const activeTabEl = tabElMap.get(activeTab.value);
    if (!activeTabEl) return;

    const container = containerRef.value;
    const tabRect = activeTabEl.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // 如果当前标签在可视区域外，则滚动到可见位置
    if (tabRect.left < containerRect.left || tabRect.right > containerRect.right) {
      const scrollLeft = tabRect.left - containerRect.left + container.scrollLeft;
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }

  // 监听路由变化，自动滚动到当前激活的标签
  watch(
    () => route.path,
    () => {
      nextTick(() => {
        scrollToActiveTab();
      });
    },
    { immediate: true }
  );

  function handleMouseDown(e: MouseEvent) {
    if (!containerRef.value) return;
    isDragging.value = true;
    startX.value = e.pageX;
    scrollLeft.value = containerRef.value.scrollLeft;
    containerRef.value.style.cursor = 'grabbing';
    containerRef.value.style.userSelect = 'none';
  }

  function handleMouseMove(e: MouseEvent) {
    if (!isDragging.value || !containerRef.value) return;
    e.preventDefault();
    const x = e.pageX;
    const walk = (x - startX.value) * 1.5; // 拖拽速度
    containerRef.value.scrollLeft = scrollLeft.value - walk;
  }

  function handleMouseUp() {
    if (!containerRef.value) return;
    isDragging.value = false;
    containerRef.value.style.cursor = 'grab';
    containerRef.value.style.userSelect = '';
  }

  function handleMouseLeave() {
    if (isDragging.value) {
      handleMouseUp();
    }
  }

  onUnmounted(() => {
    document.removeEventListener('mouseup', handleMouseUp);
    document.removeEventListener('mouseleave', handleMouseLeave);
    document.removeEventListener('click', closeMenu);
  });

  // 右键菜单相关
  const contextMenuVisible = ref(false);
  const contextMenuLeft = ref(0);
  const contextMenuTop = ref(0);
  const targetTabPath = ref('');

  function handleContextMenu(e: MouseEvent, tab: MenuItem) {
    e.preventDefault();
    contextMenuVisible.value = true;
    contextMenuLeft.value = e.clientX;
    contextMenuTop.value = e.clientY;
    targetTabPath.value = tab.path;
  }

  function closeMenu() {
    contextMenuVisible.value = false;
  }

  // 关闭当前
  async function handleCloseCurrent() {
    if (targetTabPath.value) {
      await closeTab(targetTabPath.value, new Event('click'));
    }
    closeMenu();
  }

  // 关闭其他
  async function handleCloseOther() {
    if (targetTabPath.value) {
      await menuStore.removeOtherTabs(targetTabPath.value);
      if (activeTab.value !== targetTabPath.value) {
        openPath(targetTabPath.value);
      }
    }
    closeMenu();
  }

  // 关闭左侧
  async function handleCloseLeft() {
    if (targetTabPath.value) {
      const targetIndex = tabsList.value.findIndex(t => t.path === targetTabPath.value);
      const activeIndex = tabsList.value.findIndex(t => t.path === activeTab.value);
      
      await menuStore.removeLeftTabs(targetTabPath.value);
      
      // 如果激活的标签在左侧（被删除了），跳转到目标标签
      if (activeIndex < targetIndex) {
        openPath(targetTabPath.value);
      }
    }
    closeMenu();
  }

  // 关闭右侧
  async function handleCloseRight() {
    if (targetTabPath.value) {
      const targetIndex = tabsList.value.findIndex(t => t.path === targetTabPath.value);
      const activeIndex = tabsList.value.findIndex(t => t.path === activeTab.value);

      await menuStore.removeRightTabs(targetTabPath.value);

      // 如果激活的标签在右侧（被删除了），跳转到目标标签
      if (activeIndex > targetIndex) {
        openPath(targetTabPath.value);
      }
    }
    closeMenu();
  }

  // 关闭所有
  async function handleCloseAll() {
    await menuStore.removeAllTabs();
    if (menuStore.tabsList.length === 0) {
      router.push('/blank');
    } else {
      openPath(menuStore.tabsList[menuStore.tabsList.length - 1].path);
    }
    closeMenu();
  }

  onMounted(() => {
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('click', closeMenu);
  });
</script>

<template>
  <div
    data-testid="tabs-bar"
    class="h-9 bg-white dark:bg-gray-800 flex items-center px-2 overflow-hidden relative transition-colors duration-300"
  >
    <!-- 标签容器 - 支持横向拖拽滚动 -->
    <div
      ref="containerRef"
      class="flex items-center gap-1 flex-1 overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-x cursor-grab"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseLeave"
      style="margin-top: 10px"
    >
      <div
        v-for="tab in tabsList"
        :key="tab.path"
        :ref="(el) => setTabRef(el as HTMLElement | null, tab.path)"
        v-memo="[tab.path, tab.title, tab.icon, activeTab === tab.path]"
        data-testid="tab-item"
        :data-tab-path="tab.path"
        class="tab-item group flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm cursor-pointer whitespace-nowrap border border-transparent flex-shrink-0"
        :class="[
          activeTab === tab.path
            ? 'bg-primary-bg text-primary border-primary/30 dark:bg-gray-700'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:border-gray-200 dark:hover:border-gray-600',
        ]"
        @click="openPath(tab.path)"
        @contextmenu="handleContextMenu($event, tab)"
      >
        <i
          v-if="tab.icon"
          :class="[
            'fas',
            tab.icon,
            'text-xs flex-shrink-0',
            activeTab === tab.path ? 'text-primary' : 'text-gray-400 dark:text-gray-500',
          ]"
        />
        <span
          class="truncate max-w-[100px]"
          :class="activeTab === tab.path ? 'text-primary' : ''"
          >{{ tab.title }}</span
        >
        <button
          data-testid="tab-close"
          class="w-4 h-4 rounded-full flex items-center justify-center tab-close-btn"
          :class="[
            activeTab === tab.path
              ? 'opacity-100 hover:bg-gray-200 dark:hover:bg-gray-600'
              : 'opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-600',
          ]"
          @click="closeTab(tab.path, $event)"
        >
          <i
            class="fas fa-times text-[12px] not-italic"
            :class="
              activeTab === tab.path
                ? 'text-primary'
                : 'text-gray-400 dark:text-gray-500'
            "
          />
        </button>
      </div>
    </div>

    <!-- 右键菜单 -->
    <Teleport to="body">
      <div
        v-if="contextMenuVisible"
        data-testid="tab-context-menu"
        class="fixed z-[9999] bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 py-1 min-w-[140px]"
        :style="{ left: `${contextMenuLeft}px`, top: `${contextMenuTop}px` }"
        @click.stop
      >
        <div
          data-testid="tab-context-close-current"
          class="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-2"
          @click="handleCloseCurrent"
        >
          <i class="fas fa-times w-4"></i>
          <span>关闭</span>
        </div>
        <div
          data-testid="tab-context-close-other"
          class="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-2"
          @click="handleCloseOther"
        >
          <i class="fas fa-arrows-alt-h w-4"></i>
          <span>关闭其它</span>
        </div>
        <div
          data-testid="tab-context-close-left"
          class="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-2"
          @click="handleCloseLeft"
        >
          <i class="fas fa-arrow-left w-4"></i>
          <span>关闭左侧</span>
        </div>
        <div
          data-testid="tab-context-close-right"
          class="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-2"
          @click="handleCloseRight"
        >
          <i class="fas fa-arrow-right w-4"></i>
          <span>关闭右侧</span>
        </div>
        <div class="h-[1px] bg-gray-200 dark:bg-gray-700 my-1"></div>
        <div
          data-testid="tab-context-close-all"
          class="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-2"
          @click="handleCloseAll"
        >
          <i class="fas fa-minus w-4"></i>
          <span>关闭所有</span>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
  .scrollbar-x {
    scrollbar-width: thin;
    scrollbar-color: rgba(156, 163, 175, 0.3) transparent;
  }

  .scrollbar-x::-webkit-scrollbar {
    height: 4px;
  }

  .scrollbar-x::-webkit-scrollbar-track {
    background: transparent;
  }

  .scrollbar-x::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.3);
    border-radius: 4px;
  }

  .scrollbar-x::-webkit-scrollbar-thumb:hover {
    background-color: rgba(156, 163, 175, 0.5);
  }

  .cursor-grab {
    cursor: grab;
  }

  .cursor-grab:active {
    cursor: grabbing;
  }

  /* 标签项：只过渡颜色相关属性，避免 transition-all 的全属性扫描开销 */
  .tab-item {
    transition:
      background-color 150ms ease,
      color 150ms ease,
      border-color 150ms ease;
  }

  /* hover/激活时提示 GPU 提前准备合成层，离开后自动回收 */
  .tab-item:hover,
  .tab-item.active {
    will-change: background-color, color;
  }

  /* 关闭按钮只过渡 opacity */
  .tab-close-btn {
    transition: opacity 120ms ease, background-color 120ms ease;
  }
</style>
