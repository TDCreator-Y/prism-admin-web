<script setup lang="ts">
  import { computed } from 'vue';
  import { useMenuStore } from '../global-menu/store';
  import type { MenuItem } from '../global-menu/types';
  import { useUmdMenuConfigStore } from '@/store/modules/umd-menu-config';

  const menuStore = useMenuStore();
  const umdConfig = useUmdMenuConfigStore();

  // 是否混合布局
  const isMixLayout = computed(() => menuStore.theme.layout === 'mix');

  // 激活路径：始终使用当前路由，让 GlobalMenuItem 自动高亮
  const activePath = computed(() => undefined);

  // 折叠状态
  const collapsed = computed(() => menuStore.siderCollapsed);

  // 侧边栏宽度样式
  const siderWidth = computed(() => (collapsed.value ? '72px' : '220px'));

  /**
   * 对 UMD 菜单项做响应式过滤：
   * - 非 UMD 项直接保留
   * - UMD 组件叶子：按 isComponentVisible 过滤
   * - UMD 库 folder：按 isLibVisible + 子项是否为空过滤（递归）
   */
  function filterUmdItems(items: MenuItem[]): MenuItem[] {
    const result: MenuItem[] = [];

    for (const item of items) {
      const libName = item.meta?.umdLibrary as string | undefined;

      // 非 UMD 菜单项，直接保留（递归处理子项）
      if (!libName) {
        if (item.children?.length) {
          result.push({ ...item, children: filterUmdItems(item.children) });
        } else {
          result.push(item);
        }
        continue;
      }

      const compName = item.meta?.umdComponent as string | undefined;

      if (compName) {
        // 叶子节点：按组件可见性过滤
        if (umdConfig.isComponentVisible(libName, compName)) {
          result.push(item);
        }
      } else {
        // 库 folder 节点：先过滤子项，再判断是否保留 folder
        if (!umdConfig.isLibVisible(libName)) continue;

        const filteredChildren = item.children?.length ? filterUmdItems(item.children) : [];

        if (filteredChildren.length > 0) {
          result.push({ ...item, children: filteredChildren });
        }
      }
    }

    return result;
  }

  // 最终菜单列表（经过 UMD 可见性过滤）
  const menuList = computed(() => {
    const filtered = filterUmdItems(menuStore.menuList);
    if (isMixLayout.value) {
      // 混合模式：侧边显示激活根节点的子菜单（子级菜单）
      const activeRoot = filtered.find(item => item.key === menuStore.mixActiveRootKey);
      return activeRoot?.children || [];
    }
    return filtered;
  });

  // Logo 区域点击事件
  function handleLogoClick() {
    // 可以添加 Logo 点击逻辑
  }

  // 获取全局配置中的 Logo 和显示名称
  const systemName = computed(() => {
    return window.uiGlobalConfig?.DisplayName || 'Dashboard LightWeight';
  });

  const systemIcon = computed(() => {
    return window.uiGlobalConfig?.Icon || 'fas fa-bolt';
  });
</script>

<template>
  <aside
    class="h-screen flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 overflow-hidden"
    :style="{ width: siderWidth }"
  >
    <!-- Logo 区域 -->
    <div
      class="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-700 cursor-pointer"
      @click="handleLogoClick"
    >
      <template v-if="!collapsed">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <i :class="[systemIcon, 'text-white']" />
          </div>
          <span class="text-lg font-bold text-gray-800 dark:text-white">{{ systemName }}</span>
        </div>
      </template>
      <template v-else>
        <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <i :class="[systemIcon, 'text-white']" />
        </div>
      </template>
    </div>

    <!-- 菜单滚动区域 -->
    <div
      :class="[
        'flex-1 py-4 scrollbar-hide overflow-y-auto overflow-x-hidden',
        !collapsed && 'px-3',
      ]"
    >
      <GlobalMenu
        :menu="menuList"
        :collapsed="collapsed"
        :active-path="activePath"
        @select="menuStore.addTab"
      />
    </div>

    <!-- 底部折叠按钮 -->
    <div class="border-t border-gray-200 dark:border-gray-700 p-3">
      <button
        class="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors duration-200"
        @click="menuStore.toggleSider()"
      >
        <i
          :class="[
            'fas transition-transform duration-200',
            collapsed ? 'fa-angle-right' : 'fa-angle-left',
          ]"
        />
        <span
          v-if="!collapsed"
          class="text-sm"
          >收起</span
        >
      </button>
    </div>
  </aside>
</template>
