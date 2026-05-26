<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMenuStore } from '../modules/global-menu/store'
import type { MenuItem } from '../modules/global-menu/types'

const menuStore = useMenuStore()

const layoutMode = computed(() => menuStore.theme.layout)

const showSider = computed(() => {
  if (layoutMode.value === 'side') return true
  if (layoutMode.value === 'mix') {
    // 混合模式下，只有当侧边栏有菜单项时才显示
    return menuStore.mixSiderMenuList.length > 0
  }
  return false
})

const themeDrawerVisible = ref(false)

function handleMenuSelect(item: MenuItem) {
  menuStore.setSelectedKey(item.path)
  menuStore.addTab(item)
}

function openThemeDrawer() {
  themeDrawerVisible.value = true
}

onMounted(() => {
  // 检查是否需要登录后刷新
  if (sessionStorage.getItem('need_reload_after_login') === 'true') {
    sessionStorage.removeItem('need_reload_after_login');
    window.location.reload();
    return; // 刷新前阻止后续逻辑
  }

  if (menuStore.theme.darkMode) {
    document.documentElement.classList.add('dark')
  }
})
</script>

<template>
  <div
    data-testid="app-layout"
    class="h-screen flex flex-row bg-gray-50 dark:bg-gray-900 overflow-hidden transition-colors duration-300"
  >
    <!-- 侧边栏 -->
    <GlobalSider v-if="showSider" class="flex-shrink-0" />

    <!-- 主内容区 -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- 头部 -->
      <GlobalHeader
        :show-sider-toggle="showSider"
        @open-theme-drawer="openThemeDrawer"
      />

      <!-- 内容区 -->
      <GlobalContent class="flex-1" />
    </div>

    <GlobalWatermark />

    <!-- 主题抽屉 -->
    <ThemeDrawer v-model="themeDrawerVisible" />
  </div>
</template>
