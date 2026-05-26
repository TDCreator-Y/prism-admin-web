import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { readJsonStorage, STORAGE_KEYS, STORAGE_KEY_CANDIDATES } from '@/utils/storage-keys';

// 单个 UMD 库的配置
interface LibConfig {
  enabled: boolean;
  components: Record<string, boolean>;
}

// 全量配置：key 为库名
type UmdMenuConfig = Record<string, LibConfig>;

function loadFromStorage(): UmdMenuConfig {
  try {
    return readJsonStorage<UmdMenuConfig>(STORAGE_KEY_CANDIDATES.umdMenuConfig, {});
  } catch {
    return {};
  }
}

export const useUmdMenuConfigStore = defineStore('umd-menu-config', () => {
  const config = ref<UmdMenuConfig>(loadFromStorage());

  // 变更时自动持久化
  watch(
    config,
    val => {
      try {
        // 统一写入 app-* 新键，旧键只作为回退读取来源。
        localStorage.setItem(STORAGE_KEYS.umdMenuConfig, JSON.stringify(val));
      } catch (e) {
        console.warn('[UmdMenuConfig] 保存失败:', e);
      }
    },
    { deep: true }
  );

  // ——— 读取器（undefined = 默认可见）———

  /** 库整体是否可见 */
  function isLibVisible(libName: string): boolean {
    return config.value[libName]?.enabled !== false;
  }

  /** 单个组件是否可见（库不可见时组件也不可见） */
  function isComponentVisible(libName: string, compName: string): boolean {
    if (!isLibVisible(libName)) return false;
    return config.value[libName]?.components?.[compName] !== false;
  }

  // ——— 操作 ———

  /** 切换整个库的可见状态 */
  function toggleLib(libName: string) {
    const nowVisible = isLibVisible(libName);
    if (!config.value[libName]) {
      config.value[libName] = { enabled: false, components: {} };
    } else {
      config.value[libName] = { ...config.value[libName], enabled: !nowVisible };
    }
  }

  /** 切换单个组件的可见状态 */
  function toggleComponent(libName: string, compName: string) {
    const nowVisible = isComponentVisible(libName, compName);
    if (!config.value[libName]) {
      // 库尚未有配置记录：初始化为"库开启，此组件关闭"
      config.value[libName] = { enabled: true, components: { [compName]: false } };
      return;
    }
    config.value[libName].components[compName] = !nowVisible;
  }

  /** 重置某个库的配置（回到默认全部可见） */
  function resetLib(libName: string) {
    if (config.value[libName]) {
      delete config.value[libName];
    }
  }

  /** 重置所有配置 */
  function resetAll() {
    config.value = {};
  }

  return {
    config,
    isLibVisible,
    isComponentVisible,
    toggleLib,
    toggleComponent,
    resetLib,
    resetAll,
  };
});

