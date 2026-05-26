<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useMenuStore } from '../global-menu/store';
import { http, HttpError } from '@/utils/http';
import { useToast } from '@/composables/useToast';

defineEmits<{ (e: 'open-theme-drawer'): void }>();

const router = useRouter();
const route = useRoute();
const menuStore = useMenuStore();
const toast = useToast();

const isFullscreen = ref(false);

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

function onFullscreenChange() {
  isFullscreen.value = !!document.fullscreenElement;
}

async function refreshCurrentTab() {
  const currentPath = route.path;
  if (currentPath === '/blank') return;

  const originalIndex = menuStore.tabsList.findIndex(t => t.path === currentPath);
  if (originalIndex === -1) return;

  const savedTab = { ...menuStore.tabsList[originalIndex] };
  await menuStore.removeTab(currentPath);
  await router.push('/blank');
  await nextTick();

  const insertIndex = Math.min(originalIndex, menuStore.tabsList.length);
  menuStore.tabsList.splice(insertIndex, 0, savedTab);
  router.push(currentPath);
}

const userDropdownVisible = ref(false);

async function handleLogout() {
  try {
    await http.post('/api/auth/logout.json');
  } catch (error) {
    // 401 说明 session 已过期，照常继续清理；其他错误给出提示但不阻塞登出
    if (!(error instanceof HttpError && error.isUnauthorized)) {
      const msg = error instanceof HttpError ? error.message : '登出请求失败，已在本地清除会话';
      toast.warn(msg);
      console.error('[HeaderActionBar] 登出失败:', error);
    }
  } finally {
    menuStore.resetState();
    localStorage.clear();
    sessionStorage.clear();
    router.replace('/login');
  }
}

const currentUserName = computed(() => {
  const ctx = window.AppContext || window.appContext;
  return ctx?.CurrentMember?.DisplayName || 'Admin';
});

onMounted(() => {
  document.addEventListener('fullscreenchange', onFullscreenChange);
});

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', onFullscreenChange);
});
</script>

<template>
  <div class="flex items-center gap-1">
    <!-- 全屏按钮 -->
    <button
      class="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
      :title="isFullscreen ? '退出全屏' : '全屏'"
      @click="toggleFullscreen"
    >
      <i :class="['fas', isFullscreen ? 'fa-compress' : 'fa-expand']" />
    </button>

    <!-- 刷新当前标签页按钮 -->
    <button
      class="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
      title="刷新当前页"
      @click="refreshCurrentTab"
    >
      <i class="fas fa-redo-alt" />
    </button>

    <!-- 主题切换按钮 -->
    <button
      class="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
      title="切换主题"
      @click="menuStore.toggleDarkMode()"
    >
      <i :class="['fas', menuStore.theme.darkMode ? 'fa-sun' : 'fa-moon']" />
    </button>

    <!-- 用户下拉菜单 -->
    <div
      class="relative ml-2"
      @mouseenter="userDropdownVisible = true"
      @mouseleave="userDropdownVisible = false"
    >
      <button
        class="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div
          class="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center"
        >
          <i class="fas fa-user text-blue-600 dark:text-blue-400" />
        </div>
        <span class="text-sm text-gray-600 dark:text-gray-400">{{ currentUserName }}</span>
        <i class="fas fa-chevron-down text-xs text-gray-400 dark:text-gray-500" />
      </button>

      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="userDropdownVisible"
          class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-[200]"
        >
          <a
            href="#"
            class="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50"
          >
            <i class="fas fa-user-circle w-4" />
            <span>个人中心</span>
          </a>
          <a
            href="#"
            class="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50"
          >
            <i class="fas fa-cog w-4" />
            <span>设置</span>
          </a>
          <hr class="my-1 border-gray-200 dark:border-gray-700" />
          <a
            href="#"
            class="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700/50"
            @click.prevent="handleLogout"
          >
            <i class="fas fa-sign-out-alt w-4" />
            <span>退出登录</span>
          </a>
        </div>
      </Transition>
    </div>

    <!-- 主题设置按钮 -->
    <button
      class="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
      title="主题设置"
      @click="$emit('open-theme-drawer')"
    >
      <i class="fas fa-palette" />
    </button>
  </div>
</template>
