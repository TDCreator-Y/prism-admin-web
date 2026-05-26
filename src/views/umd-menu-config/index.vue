<script setup lang="ts">
import { ref, computed } from 'vue';
import { remoteLibraries } from '@/utils/remote-component-loader';
import type {
  RemoteComponentDetail,
  RemoteLibraryInfo,
} from '@/utils/remote-component-types';
import { useUmdMenuConfigStore } from '@/store/modules/umd-menu-config';

const umdConfig = useUmdMenuConfigStore();

// 与 remote-component-loader.ts generateUmdRoutes 保持一致：排除元数据导出
const EXCLUDED_KEYS = new Set([
  'default', 'install', 'manifest', 'componentsMap',
  'componentsDetailed', 'version', '__esModule', 'VueDemoComponent',
]);

// 获取库中真正的功能组件 key（排除元数据字段）
function getCompKeys(lib: RemoteLibraryInfo): string[] {
  return (lib.componentKeys ?? []).filter(k => !EXCLUDED_KEYS.has(k));
}

function findCompDetail(
  lib: RemoteLibraryInfo,
  compName: string
): RemoteComponentDetail | undefined {
  return lib.componentsDetailed?.find(d => d.name === compName || d.tag === compName);
}

// 已成功加载且有有效功能组件的 UMD 库
const umdLibraries = computed(() =>
  remoteLibraries.value.filter(
    lib => lib.status === 'success' && getCompKeys(lib).length > 0
  )
);

// 展开状态：每个库默认收起
const expandedLibs = ref<Record<string, boolean>>({});

// 从 componentsDetailed 获取组件友好名称
function getCompDisplayName(lib: RemoteLibraryInfo, compName: string): string {
  const detail = findCompDetail(lib, compName);
  return detail?.zhName ?? detail?.displayName ?? compName;
}

// 从 componentsDetailed 获取组件描述
function getCompDescription(lib: RemoteLibraryInfo, compName: string): string {
  const detail = findCompDetail(lib, compName);
  return detail?.description ?? '';
}

// 从 componentsDetailed 获取组件图标
function getCompIcon(lib: RemoteLibraryInfo, compName: string): string {
  const detail = findCompDetail(lib, compName);
  const raw: string | undefined = detail?.icon;
  return raw ?? 'fa-puzzle-piece';
}

// 当前库所有可见组件的计数
function visibleCount(lib: RemoteLibraryInfo): number {
  return getCompKeys(lib).filter(k => umdConfig.isComponentVisible(lib.name, k)).length;
}

// 全选 / 取消全选当前库的组件
function toggleAllComponents(lib: RemoteLibraryInfo, selectAll: boolean) {
  getCompKeys(lib).forEach(k => {
    const visible = umdConfig.isComponentVisible(lib.name, k);
    if (selectAll && !visible) umdConfig.toggleComponent(lib.name, k);
    if (!selectAll && visible) umdConfig.toggleComponent(lib.name, k);
  });
}

// 当前库是否全选
function isAllSelected(lib: RemoteLibraryInfo): boolean {
  return getCompKeys(lib).every(k => umdConfig.isComponentVisible(lib.name, k));
}
</script>

<template>
  <div class="space-y-6">
    <!-- 页头 -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-white">UMD组件菜单配置</h1>
      <div class="flex items-center gap-3">
        <span class="text-sm text-gray-500 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
          共 {{ umdLibraries.length }} 个库
        </span>
        <button
          class="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors"
          @click="umdConfig.resetAll()"
        >
          <i class="fas fa-undo-alt" />
          重置全部
        </button>
      </div>
    </div>

    <!-- 空状态 -->
    <div
      v-if="umdLibraries.length === 0"
      class="bg-white dark:bg-gray-800 rounded-xl p-12 shadow-sm text-center text-gray-500"
    >
      <i class="fas fa-inbox text-4xl mb-4 text-gray-300" />
      <p>暂无已加载的远程组件库</p>
      <p class="text-sm text-gray-400 mt-1">请先在 UMD 文件配置页面确认组件库已成功加载。</p>
    </div>

    <!-- 库列表 -->
    <div
      v-for="lib in umdLibraries"
      :key="lib.name"
      class="bg-white dark:bg-gray-800 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md overflow-hidden"
    >
      <!-- 库标题区域 -->
      <div class="flex flex-col md:flex-row md:items-center justify-between p-6 gap-4 border-b border-gray-100 dark:border-gray-700">
        <div class="flex items-center gap-3 flex-1 min-w-0">
          <!-- 库图标 -->
          <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
            <i class="fas fa-cube text-blue-600 dark:text-blue-400 text-lg" />
          </div>
          <div class="min-w-0">
            <h2 class="text-lg font-bold text-gray-800 dark:text-white truncate">{{ lib.name }}</h2>
            <p class="text-xs text-gray-400 font-mono mt-0.5 truncate">{{ lib.url }}</p>
          </div>
        </div>

        <!-- 右侧操作区 -->
        <div class="flex items-center gap-3 flex-shrink-0">
          <!-- 已显示计数 -->
          <span class="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
            已显示 {{ visibleCount(lib) }} / {{ getCompKeys(lib).length }} 个组件
          </span>

          <!-- 重置该库 -->
          <button
            class="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            @click="umdConfig.resetLib(lib.name)"
          >
            重置
          </button>

          <!-- 库整体开关 -->
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
              {{ umdConfig.isLibVisible(lib.name) ? '显示' : '隐藏' }}
            </span>
            <div
              class="relative w-11 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0"
              :class="umdConfig.isLibVisible(lib.name) ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'"
              @click="umdConfig.toggleLib(lib.name)"
            >
              <div
                class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform"
                :class="umdConfig.isLibVisible(lib.name) ? 'translate-x-5' : 'translate-x-0'"
              />
            </div>
          </div>

          <!-- 展开 / 收起 -->
          <button
            class="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            @click="expandedLibs[lib.name] = !expandedLibs[lib.name]"
          >
            <i
              class="fas text-xs transition-transform duration-200"
              :class="expandedLibs[lib.name] ? 'fa-chevron-up' : 'fa-chevron-down'"
            />
            {{ expandedLibs[lib.name] ? '收起' : '展开组件' }}
          </button>
        </div>
      </div>

      <!-- 组件列表（展开时显示） -->
      <Transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-1"
      >
        <div v-if="expandedLibs[lib.name]" class="p-6 pt-4 space-y-4">
          <!-- 批量操作 -->
          <div
            class="flex items-center justify-between"
            :class="{ 'opacity-50 pointer-events-none': !umdConfig.isLibVisible(lib.name) }"
          >
            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">组件列表</span>
            <div class="flex items-center gap-3">
              <button
                class="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                @click="toggleAllComponents(lib, true)"
              >
                全部显示
              </button>
              <span class="text-gray-300 dark:text-gray-600">|</span>
              <button
                class="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                @click="toggleAllComponents(lib, false)"
              >
                全部隐藏
              </button>
            </div>
          </div>

          <!-- 组件网格 -->
          <div
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
            :class="{ 'opacity-50 pointer-events-none': !umdConfig.isLibVisible(lib.name) }"
          >
            <label
              v-for="compName in getCompKeys(lib)"
              :key="compName"
              class="group flex items-start gap-3 border border-gray-200 dark:border-gray-700 rounded-xl p-3.5 cursor-pointer transition-all hover:shadow-md"
              :class="
                umdConfig.isComponentVisible(lib.name, compName)
                  ? 'bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-700'
                  : 'bg-gray-50 dark:bg-gray-700/30 opacity-60 hover:border-gray-300 dark:hover:border-gray-600'
              "
            >
              <!-- 复选框 -->
              <input
                type="checkbox"
                class="mt-0.5 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer flex-shrink-0"
                :checked="umdConfig.isComponentVisible(lib.name, compName)"
                :disabled="!umdConfig.isLibVisible(lib.name)"
                @change="umdConfig.toggleComponent(lib.name, compName)"
              />

              <!-- 组件信息 -->
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1.5 mb-0.5">
                  <i
                    class="fas text-xs text-gray-400 group-hover:text-blue-500 transition-colors"
                    :class="getCompIcon(lib, compName)"
                  />
                  <span class="text-sm font-medium text-gray-800 dark:text-white truncate">
                    {{ getCompDisplayName(lib, compName) }}
                  </span>
                </div>
                <p class="text-xs text-blue-600 dark:text-blue-400 font-mono truncate">
                  {{ compName }}
                </p>
                <p
                  v-if="getCompDescription(lib, compName)"
                  class="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2"
                >
                  {{ getCompDescription(lib, compName) }}
                </p>
              </div>
            </label>
          </div>
        </div>
      </Transition>
    </div>

    <!-- 说明卡片 -->
    <div class="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-6 border border-blue-100 dark:border-blue-900/30">
      <h3 class="font-bold text-blue-800 dark:text-blue-300 mb-4 flex items-center gap-2">
        <i class="fas fa-info-circle" /> 关于组件菜单配置
      </h3>
      <div class="space-y-3 text-sm text-blue-900/80 dark:text-blue-200/80">
        <p>在此页面可以控制左侧菜单中 UMD 组件的显示与隐藏，配置将自动保存到本地。</p>
        <ul class="list-disc pl-5 space-y-1.5">
          <li><strong>库开关：</strong>关闭后，该库下所有组件菜单项将整体隐藏。</li>
          <li><strong>组件开关：</strong>可单独控制每个组件菜单项的可见性。</li>
          <li><strong>重置：</strong>恢复为默认状态（全部显示）。</li>
        </ul>
        <p class="text-xs opacity-70 mt-2">
          * 配置仅影响菜单展示，不影响组件的实际注册和加载。刷新页面后配置仍然保留。
        </p>
      </div>
    </div>
  </div>
</template>
