<script setup lang="ts">
  import { computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { useMenuStore } from '../global-menu/store';
  import GlobalTopMenu from '../global-menu/GlobalTopMenu.vue';
  import HeaderActionBar from './HeaderActionBar.vue';
  import type { MenuItem } from '../global-menu/types';

  defineProps<{
    showSiderToggle?: boolean;
  }>();

  const router = useRouter();
  const menuStore = useMenuStore();

  function handleMenuSelect(item: MenuItem) {
    // mix 模式：点击顶部根节点时立即更新侧边子菜单
    if (isMixLayout.value) {
      menuStore.setMixActiveRoot(item.key);
      // 根节点在原始菜单树中有子项，说明它只是容器而非页面，不加入标签页
      const original = menuStore.menuList.find(m => m.key === item.key);
      if (original?.children?.length) return;
    }
    menuStore.addTab(item);
  }

  // 是否为顶部菜单布局
  const isTopLayout = computed(() => menuStore.theme.layout === 'top');

  // 顶部菜单列表（只显示一级菜单）
  const topMenuList = computed(() => {
    return menuStore.menuList.filter(item => !item.hidden);
  });

  // 是否为混合布局
  const isMixLayout = computed(() => menuStore.theme.layout === 'mix');

  // 混合布局下的顶部菜单
  const mixHeaderMenuList = computed(() => menuStore.mixHeaderMenuList);

  // 全局配置相关的展示字段
  const systemName = computed(() => {
    return window.uiGlobalConfig?.DisplayName || 'Prism';
  });

  const systemIcon = computed(() => {
    return window.uiGlobalConfig?.Icon || 'fas fa-bolt';
  });


</script>

<template>
  <!-- 顶部菜单布局 -->
  <header
    v-if="isTopLayout"
    class="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between relative z-[20] transition-colors duration-300"
  >
    <!-- 左侧：Logo（固定宽度） -->
    <div
      class="flex items-center px-6 border-r border-gray-200 dark:border-gray-700 h-full w-auto flex-shrink-0"
    >
      <div class="flex items-center gap-2 cursor-pointer">
        <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <i :class="[systemIcon, 'text-white']" />
        </div>
        <span class="text-lg font-bold text-gray-800 dark:text-white">{{ systemName }}</span>
      </div>
    </div>

    <!-- 中间：顶部导航菜单（自适应，占据剩余空间） -->
    <div class="h-full flex-1 overflow-visible">
      <GlobalTopMenu
        :menu="topMenuList"
        @select="handleMenuSelect"
      />
    </div>

    <!-- 右侧工具栏 -->
    <HeaderActionBar class="pr-4" @open-theme-drawer="$emit('open-theme-drawer')" />
  </header>

  <!-- 侧边栏/混合布局 -->
  <header
    v-else
    class="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 relative z-[50] transition-colors duration-300"
  >
    <!-- 左侧：侧边栏折叠按钮 或 Logo -->
    <div class="flex items-center gap-4 flex-shrink-0">
      <button
        v-if="showSiderToggle !== false"
        class="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
        @click="menuStore.toggleSider()"
      >
        <i class="fas fa-bars" />
      </button>
      <div
        v-else-if="isMixLayout"
        class="flex items-center gap-2 cursor-pointer pr-4 border-r border-gray-200 dark:border-gray-700"
        @click="router.push('/')"
      >
        <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <i :class="[systemIcon, 'text-white']" />
        </div>
        <span class="text-lg font-bold text-gray-800 dark:text-white">{{ systemName }}</span>
      </div>
    </div>

    <!-- 混合布局下的二级菜单 -->
    <div
      v-if="isMixLayout"
      class="flex-1 h-full overflow-visible ml-4"
    >
      <GlobalTopMenu
        :menu="mixHeaderMenuList"
        layout-mode="mix"
        @select="handleMenuSelect"
      />
    </div>

    <!-- 右侧工具栏 -->
    <HeaderActionBar @open-theme-drawer="$emit('open-theme-drawer')" />
  </header>
</template>
