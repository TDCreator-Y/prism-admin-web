import { computed, onMounted, onUnmounted } from 'vue';
import type { useMenuStore } from '@/layouts/modules/global-menu/store';
import { matchesStorageKey, STORAGE_KEY_CANDIDATES } from '@/utils/storage-keys';

type MenuStoreInstance = ReturnType<typeof useMenuStore>;

export function useLoginThemeSync(menuStore: MenuStoreInstance) {
  const isDark = computed(() => menuStore.theme.darkMode);

  function toggleTheme() {
    menuStore.toggleDarkMode();
  }

  function onStorageChange(event: StorageEvent) {
    if (!matchesStorageKey(event.key, STORAGE_KEY_CANDIDATES.theme) || !event.newValue) return;

    try {
      const config = JSON.parse(event.newValue);
      if (typeof config.darkMode === 'boolean') {
        menuStore.setTheme({ darkMode: config.darkMode });
      }
    } catch {
      // 忽略无效的跨标签页同步数据，避免影响当前登录页交互
    }
  }

  onMounted(() => window.addEventListener('storage', onStorageChange));
  onUnmounted(() => window.removeEventListener('storage', onStorageChange));

  return {
    isDark,
    toggleTheme,
  };
}
