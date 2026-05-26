<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
  import { useRoute } from 'vue-router';
  import { useMenuStore } from './store';
  import type { MenuItem } from './types';
  import { useAppOpenTab } from '@/composables/useAppOpenTab';

  defineOptions({
    name: 'GlobalTopMenu',
  });

  const props = defineProps<{
    menu: MenuItem[];
    layoutMode?: 'top' | 'mix';
  }>();

  const emit = defineEmits<{
    (e: 'select', item: MenuItem): void;
  }>();

  const route = useRoute();
  const menuStore = useMenuStore();
  const { openPath } = useAppOpenTab();

  // 菜单容器引用
  const containerRef = ref<HTMLElement | null>(null);

  // 容器宽度（响应式）
  const containerWidth = ref(0);

  // 更多菜单状态
  const moreMenuVisible = ref(false);
  const moreMenuOpenKeys = ref<string[]>([]);

  const selectedKey = computed(() => route.path);
  const openKeys = computed(() => menuStore.openKeys);

  // 可见菜单（未隐藏的）
  const visibleMenus = computed(() => {
    return props.menu.filter(item => !item.hidden);
  });

  // 主菜单区域显示的菜单项（不包括最后一个"更多"项）
  const displayedMenus = computed(() => {
    const totalItems = visibleMenus.value.length;
    if (totalItems === 0) return [];

    const currentWidth = containerWidth.value;
    // 如果还没获取到宽度，显示所有菜单
    if (currentWidth <= 0) return visibleMenus.value;

    const itemMinWidth = props.layoutMode === 'mix' ? 125 : 145; // 每个菜单项最小估算宽度
    const moreButtonWidth = 40; // 更多按钮宽度

    // 混合模式逻辑：激进全显示
    if (props.layoutMode === 'mix') {
      const estimatedTotalWidth = totalItems * itemMinWidth;
      if (estimatedTotalWidth <= currentWidth) {
        return visibleMenus.value;
      }
    }

    // 顶部模式逻辑：保守折叠（总是预留更多按钮空间，避免布局错乱）
    // 或者当空间不足时才折叠
    const availableWidth = currentWidth - moreButtonWidth;
    const maxCount = Math.floor(availableWidth / itemMinWidth);

    // 至少显示一个
    const count = Math.max(1, maxCount);

    // 如果计算出的数量比总数小，则截断
    if (count < totalItems) {
      return visibleMenus.value.slice(0, count);
    }

    return visibleMenus.value;
  });

  // 溢出的菜单项（放入更多下拉菜单）
  const overflowedMenus = computed(() => {
    const totalItems = visibleMenus.value.length;
    const displayed = displayedMenus.value.length;
    if (displayed >= totalItems) return [];
    return visibleMenus.value.slice(displayed);
  });

  // 更多按钮显示条件
  const showMoreButton = computed(() => {
    return overflowedMenus.value.length > 0;
  });

  // 更新容器宽度
  function updateWidth() {
    if (containerRef.value) {
      containerWidth.value = containerRef.value.clientWidth;
    }
  }

  // 监听容器尺寸变化
  let resizeObserver: ResizeObserver | null = null;

  onMounted(async () => {
    // 等待DOM渲染完成后获取宽度
    await nextTick();
    updateWidth();

    // 使用 ResizeObserver 监听容器宽度变化
    resizeObserver = new ResizeObserver(() => {
      updateWidth();
    });
    if (containerRef.value) {
      resizeObserver.observe(containerRef.value);
    }
  });

  onUnmounted(() => {
    if (resizeObserver) {
      resizeObserver.disconnect();
    }
  });

  // 判断是否应该显示下拉箭头
  function hasChildren(item: MenuItem): boolean {
    return !!(item.children && item.children.length > 0);
  }

  // 处理菜单选择
  async function handleSelect(item: MenuItem) {
    emit('select', item);
    // 混合模式下，顶部仅展示根节点（children 已被剥除）
    // 若在原始菜单树中有子项，说明是容器节点，不导航、不加标签
    if (props.layoutMode === 'mix') {
      const original = menuStore.menuList.find(m => m.key === item.key);
      if (original?.children?.length) return;
    }
    if (!hasChildren(item)) {
      await openPath(item.path);
    }
  }

  // 鼠标进入菜单项（主菜单）
  function handleMouseEnter(key: string) {
    menuStore.openKey(key);
  }

  // 鼠标离开菜单项（主菜单）
  function handleMouseLeave() {
    menuStore.closeAllKeys();
  }

  // 判断菜单项是否激活
  function isActive(item: MenuItem): boolean {
    // mix 模式下顶部显示根节点（children 已被剥除），用 startsWith 匹配子路由
    if (props.layoutMode === 'mix') {
      return selectedKey.value.startsWith(item.path);
    }
    if (!hasChildren(item)) {
      return selectedKey.value === item.path;
    }
    return selectedKey.value.startsWith(item.path);
  }

  // 显示更多菜单
  function showMoreMenu() {
    moreMenuVisible.value = true;
  }

  // 隐藏更多菜单
  function hideMoreMenu() {
    moreMenuVisible.value = false;
    moreMenuOpenKeys.value = []; // 重置更多菜单的展开状态
  }

  // 鼠标进入更多菜单中的项
  function handleMoreMenuEnter(key: string) {
    if (!moreMenuOpenKeys.value.includes(key)) {
      moreMenuOpenKeys.value.push(key);
    }
  }

  // 鼠标离开更多菜单中的项
  function handleMoreMenuLeave() {
    moreMenuOpenKeys.value = [];
  }

  // 检查更多菜单中某个 key 是否展开
  function isMoreMenuOpen(key: string): boolean {
    return moreMenuOpenKeys.value.includes(key);
  }

  // 监听窗口大小变化，重置更多菜单状态
  function handleResize() {
    moreMenuVisible.value = false;
    moreMenuOpenKeys.value = [];
  }

  onMounted(() => {
    window.addEventListener('resize', handleResize);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
  });
</script>

<template>
  <nav
    ref="containerRef"
    class="h-full w-full flex-shrink-0 relative"
  >
    <ul class="flex items-center h-full w-full">
      <!-- 主菜单项 -->
      <template
        v-for="item in displayedMenus"
        :key="item.key"
      >
        <!-- 一级菜单项（无子菜单） -->
        <li
          v-if="!hasChildren(item)"
          class="h-full flex-shrink-0"
        >
          <button
            class="h-full flex items-center gap-1.5 px-3 text-sm font-medium transition-all duration-200 border-b-2 -mb-px"
            :class="[
              isActive(item)
                ? 'text-primary border-primary dark:text-primary-dark dark:border-primary-dark'
                : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600',
            ]"
            @click="handleSelect(item)"
          >
            <i
              v-if="item.icon"
              :class="['fas', item.icon, 'text-base']"
            />
            <span class="truncate max-w-[110px]">{{ item.title }}</span>
          </button>
        </li>

        <!-- 有子菜单的一级菜单项 -->
        <li
          v-else
          class="h-full relative flex-shrink-0"
          @mouseenter="handleMouseEnter(item.key)"
          @mouseleave="handleMouseLeave"
        >
          <button
            class="h-full flex items-center gap-1.5 px-3 text-sm font-medium transition-all duration-200 border-b-2 -mb-px"
            :class="[
              openKeys.includes(item.key) || isActive(item)
                ? 'text-primary border-primary dark:text-primary-dark dark:border-primary-dark'
                : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600',
            ]"
          >
            <i
              v-if="item.icon"
              :class="['fas', item.icon, 'text-base']"
            />
            <span class="truncate max-w-[100px]">{{ item.title }}</span>
            <i
              class="fas fa-chevron-down text-xs transition-transform duration-200 flex-shrink-0"
              :class="{ 'rotate-180': openKeys.includes(item.key) }"
            />
          </button>

          <!-- 子菜单 -->
          <Transition
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="opacity-0 -translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all duration-150 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-2"
          >
            <div
              v-if="openKeys.includes(item.key)"
              class="absolute left-0 top-full pt-1 z-50"
              @mouseenter="handleMouseEnter(item.key)"
              @mouseleave="handleMouseLeave"
            >
              <div
                class="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 min-w-48"
              >
                <ul class="flex flex-col">
                  <template
                    v-for="child in item.children"
                    :key="child.key"
                  >
                    <li v-if="!hasChildren(child)">
                      <button
                        class="flex items-center gap-3 px-4 py-2 text-sm transition-colors whitespace-nowrap w-full text-left"
                        :class="[
                          selectedKey === child.path
                            ? 'bg-primary-bg text-primary dark:text-primary-dark'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white',
                        ]"
                        @click="handleSelect(child)"
                      >
                        <i
                          v-if="child.icon"
                          :class="['fas', child.icon, 'w-5']"
                        />
                        <span>{{ child.title }}</span>
                      </button>
                    </li>
                    <li
                      v-else
                      class="relative"
                      @mouseenter="handleMouseEnter(child.key)"
                      @mouseleave="handleMouseLeave"
                    >
                      <button
                        class="w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors whitespace-nowrap text-left"
                        :class="[
                          selectedKey.startsWith(child.path)
                            ? 'bg-primary-bg text-primary dark:text-primary-dark'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white',
                        ]"
                      >
                        <i
                          v-if="child.icon"
                          :class="['fas', child.icon, 'w-5']"
                        />
                        <span>{{ child.title }}</span>
                        <i
                          class="fas fa-chevron-right text-xs ml-auto transition-transform"
                          :class="{ 'rotate-90': openKeys.includes(child.key) }"
                        />
                      </button>
                      <!-- 三级菜单 -->
                      <Transition
                        enter-active-class="transition-all duration-200 ease-out"
                        enter-from-class="opacity-0 translate-x-2"
                        enter-to-class="opacity-100 translate-x-0"
                        leave-active-class="transition-all duration-150 ease-in"
                        leave-from-class="opacity-100 translate-x-0"
                        leave-to-class="opacity-0 translate-x-2"
                      >
                        <div
                          v-if="openKeys.includes(child.key)"
                          class="absolute left-full top-0 z-50"
                          @mouseenter="handleMouseEnter(child.key)"
                          @mouseleave="handleMouseLeave"
                        >
                          <div
                            class="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 min-w-48 ml-1"
                          >
                            <ul class="flex flex-col">
                              <li
                                v-for="grandchild in child.children"
                                :key="grandchild.key"
                              >
                                <button
                                  class="flex items-center gap-3 px-4 py-2 text-sm transition-colors whitespace-nowrap w-full text-left"
                                  :class="[
                                    selectedKey === grandchild.path
                                      ? 'bg-primary-bg text-primary dark:text-primary-dark'
                                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white',
                                  ]"
                                  @click="handleSelect(grandchild)"
                                >
                                  <i
                                    v-if="grandchild.icon"
                                    :class="['fas', grandchild.icon, 'w-5']"
                                  />
                                  <span>{{ grandchild.title }}</span>
                                </button>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </Transition>
                    </li>
                  </template>
                </ul>
              </div>
            </div>
          </Transition>
        </li>
      </template>

      <!-- 更多按钮 -->
      <li
        v-if="showMoreButton"
        class="h-full relative flex-shrink-0"
        @mouseenter="showMoreMenu"
        @mouseleave="hideMoreMenu"
      >
        <button
          class="h-full flex items-center gap-1 px-4 text-sm font-medium transition-all duration-200 border-b-2 -mb-px"
          :class="[
            moreMenuVisible
              ? 'text-primary border-primary dark:text-primary-dark dark:border-primary-dark'
              : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600',
          ]"
        >
          <span>⋯</span>
          <!-- <i class="fas fa-chevron-down text-xs transition-transform duration-200" :class="{ 'rotate-180': moreMenuVisible }" /> -->
        </button>

        <!-- 更多菜单下拉列表 -->
        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-150 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-2"
        >
          <div
            v-if="moreMenuVisible"
            class="absolute right-0 top-full pt-1 z-50"
            @mouseenter="showMoreMenu"
            @mouseleave="hideMoreMenu"
          >
            <div
              class="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 min-w-48"
            >
              <ul class="flex flex-col">
                <template
                  v-for="item in overflowedMenus"
                  :key="item.key"
                >
                  <li v-if="!hasChildren(item)">
                    <button
                      class="flex items-center gap-3 px-4 py-2 text-sm transition-colors whitespace-nowrap w-full text-left"
                      :class="[
                        selectedKey === item.path
                          ? 'bg-primary-bg text-primary dark:text-primary-dark'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white',
                      ]"
                      @click="handleSelect(item)"
                    >
                      <i
                        v-if="item.icon"
                        :class="['fas', item.icon, 'w-5']"
                      />
                      <span>{{ item.title }}</span>
                    </button>
                  </li>
                  <li
                    v-else
                    class="relative"
                    @mouseenter="handleMoreMenuEnter(item.key)"
                    @mouseleave="handleMoreMenuLeave"
                  >
                    <button
                      class="w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors whitespace-nowrap text-left"
                      :class="[
                        isMoreMenuOpen(item.key) || isActive(item)
                          ? 'bg-primary-bg text-primary dark:text-primary-dark'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white',
                      ]"
                    >
                      <i
                        v-if="item.icon"
                        :class="['fas', item.icon, 'w-5']"
                      />
                      <span>{{ item.title }}</span>
                      <i
                        class="fas fa-chevron-down text-xs ml-auto transition-transform duration-200"
                        :class="{ 'rotate-180': isMoreMenuOpen(item.key) }"
                      />
                    </button>
                    <Transition
                      enter-active-class="transition-all duration-200 ease-out"
                      enter-from-class="opacity-0 -translate-y-2"
                      enter-to-class="opacity-100 translate-y-0"
                      leave-active-class="transition-all duration-150 ease-in"
                      leave-from-class="opacity-100 translate-y-0"
                      leave-to-class="opacity-0 -translate-y-2"
                    >
                      <div
                        v-if="isMoreMenuOpen(item.key)"
                        class="absolute left-full top-0 z-50 ml-1"
                        @mouseenter="handleMoreMenuEnter(item.key)"
                        @mouseleave="handleMoreMenuLeave"
                      >
                        <div
                          class="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 min-w-48"
                        >
                          <ul class="flex flex-col">
                            <template
                              v-for="child in item.children"
                              :key="child.key"
                            >
                              <li>
                                <button
                                  class="flex items-center gap-3 px-4 py-2 text-sm transition-colors whitespace-nowrap w-full text-left"
                                  :class="[
                                    selectedKey === child.path
                                      ? 'bg-primary-bg text-primary dark:text-primary-dark'
                                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white',
                                  ]"
                                  @click="handleSelect(child)"
                                >
                                  <i
                                    v-if="child.icon"
                                    :class="['fas', child.icon, 'w-5']"
                                  />
                                  <span>{{ child.title }}</span>
                                </button>
                              </li>
                            </template>
                          </ul>
                        </div>
                      </div>
                    </Transition>
                  </li>
                </template>
              </ul>
            </div>
          </div>
        </Transition>
      </li>
    </ul>
  </nav>
</template>
