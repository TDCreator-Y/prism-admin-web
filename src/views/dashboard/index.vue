<script setup lang="ts">
  import { ref } from 'vue';
  import { REMOTE_COMPONENT_CONFIG_ENDPOINT } from '@/config/remote-components';
  import { remoteLibraries } from '@/utils/remote-component-loader';
  import { http, HttpError } from '@/utils/http';
  import { useToast } from '@/composables/useToast';
  import { useCancellableRequest } from '@/composables/useCancellableRequest';

  const toast = useToast();
  const { newSignal, cancel } = useCancellableRequest();
  const fileInput = ref<HTMLInputElement | null>(null);
  const isUploading = ref(false);

  const triggerFileInput = () => {
    fileInput.value?.click();
  };

  const handleFileUpload = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (!target.files || target.files.length === 0) return;

    const file = target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    isUploading.value = true;
    const signal = newSignal();
    try {
      await http.post('/api/storages.json?FolderPath=/Umd/File', formData, { signal });
      toast.success('文件上传成功！');
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      const message = error instanceof HttpError ? error.message : '文件上传失败，请重试';
      toast.error(message);
      console.error('[Dashboard] 文件上传失败:', error);
    } finally {
      isUploading.value = false;
      if (fileInput.value) fileInput.value.value = '';
    }
  };
</script>

<template>
  <div class="space-y-6" data-testid="dashboard-page">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-white">UMD文件配置读取</h1>
      <div class="flex items-center gap-3">
        <!-- Hidden File Input -->
        <input
          type="file"
          ref="fileInput"
          class="hidden"
          @change="handleFileUpload"
        />

        <!-- Upload Button -->
        <button
          @click="triggerFileInput"
          class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="isUploading"
        >
          <i
            class="fas fa-cloud-upload-alt"
            :class="{ 'animate-bounce': isUploading }"
          ></i>
          {{ isUploading ? '上传中...' : '上传文件' }}
        </button>

        <span class="text-sm text-gray-500 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
          共 {{ remoteLibraries.length }} 个库
        </span>
      </div>
    </div>

    <div
      v-if="remoteLibraries.length === 0"
      class="bg-white dark:bg-gray-800 rounded-xl p-12 shadow-sm text-center text-gray-500"
    >
      <i class="fas fa-inbox text-4xl mb-4 text-gray-300"></i>
      <p>暂无远程组件库信息</p>
    </div>

    <div
      v-for="lib in remoteLibraries"
      :key="lib.name"
      class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm space-y-6 transition-all duration-300 hover:shadow-md"
    >
      <!-- Library Header -->
      <div
        class="flex flex-col md:flex-row md:items-start justify-between border-b border-gray-100 dark:border-gray-700 pb-4 gap-4"
      >
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-2">
            <div
              class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0"
            >
              <i class="fas fa-cube text-blue-600 dark:text-blue-400 text-lg"></i>
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-800 dark:text-white">{{ lib.name }}</h2>
              <p class="text-xs text-gray-400 font-mono mt-0.5 break-all">{{ lib.url }}</p>
            </div>
          </div>

          <div class="flex flex-wrap gap-2 mt-3">
            <span
              class="px-2.5 py-0.5 rounded text-xs font-medium border"
              :class="{
                'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800':
                  lib.status === 'success',
                'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800':
                  lib.status === 'loading',
                'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800':
                  lib.status === 'error',
                'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700':
                  lib.status === 'pending',
              }"
            >
              <i class="fas fa-circle text-[8px] mr-1.5 opacity-60"></i
              >{{ lib.status.toUpperCase() }}
            </span>
            <span
              v-if="lib.registeredCount"
              class="px-2.5 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
            >
              <i class="fas fa-check-circle mr-1.5 opacity-60"></i>已注册
              {{ lib.registeredCount }} 个组件
            </span>
          </div>
        </div>
      </div>

      <!-- Manifest Info -->
      <div
        v-if="lib.manifest"
        class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm"
      >
        <div
          class="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg border border-gray-100 dark:border-gray-700"
        >
          <span class="text-xs text-gray-500 dark:text-gray-400 block mb-1">版本</span>
          <span class="font-medium text-gray-800 dark:text-gray-200">{{
            lib.manifest.version || '-'
          }}</span>
        </div>
        <div
          class="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg border border-gray-100 dark:border-gray-700"
        >
          <span class="text-xs text-gray-500 dark:text-gray-400 block mb-1">作者</span>
          <span class="font-medium text-gray-800 dark:text-gray-200">{{
            lib.manifest.author || '-'
          }}</span>
        </div>
        <div
          class="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg border border-gray-100 dark:border-gray-700 col-span-2"
        >
          <span class="text-xs text-gray-500 dark:text-gray-400 block mb-1">描述</span>
          <span class="font-medium text-gray-800 dark:text-gray-200">{{
            lib.manifest.description || '-'
          }}</span>
        </div>
      </div>

      <!-- Components List -->
      <div v-if="lib.componentsDetailed && lib.componentsDetailed.length > 0">
        <h3
          class="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2 text-sm uppercase tracking-wider"
        >
          <i class="fas fa-layer-group text-gray-400"></i> 包含组件列表
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div
            v-for="comp in lib.componentsDetailed"
            :key="comp.name"
            class="group relative border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all bg-white dark:bg-gray-800"
          >
            <div
              class="absolute top-4 right-4 text-gray-300 group-hover:text-blue-500 transition-colors"
            >
              <i class="fas fa-code"></i>
            </div>
            <div class="font-bold text-gray-800 dark:text-white mb-1 pr-6">{{ comp.name }}</div>
            <div
              class="text-xs font-medium text-blue-600 dark:text-blue-400 mb-3 bg-blue-50 dark:bg-blue-900/20 inline-block px-2 py-0.5 rounded"
            >
              {{ comp.displayName || comp.name }}
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 min-h-[2.5em]">
              {{ comp.description || '暂无描述' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Fallback Component Keys -->
      <div
        v-else-if="lib.componentKeys && lib.componentKeys.length > 0"
        class="bg-gray-50 dark:bg-gray-700/30 p-5 rounded-xl border border-gray-100 dark:border-gray-700"
      >
        <h3
          class="font-bold text-gray-700 dark:text-gray-300 mb-3 text-sm uppercase tracking-wider"
        >
          导出对象 Keys
        </h3>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="key in lib.componentKeys"
            :key="key"
            class="px-3 py-1.5 bg-white dark:bg-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-500 shadow-sm"
          >
            {{ key }}
          </span>
        </div>
      </div>

      <!-- Error Info -->
      <div
        v-if="lib.error"
        class="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm border border-red-100 dark:border-red-900/50 flex items-start gap-3"
      >
        <i class="fas fa-exclamation-triangle mt-0.5"></i>
        <div>
          <div class="font-bold mb-1">加载失败</div>
          <div>{{ lib.error }}</div>
        </div>
      </div>
    </div>

    <!-- Loading Mechanism Explanation -->
    <div
      class="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-6 border border-blue-100 dark:border-blue-900/30"
    >
      <h3 class="font-bold text-blue-800 dark:text-blue-300 mb-4 flex items-center gap-2">
        <i class="fas fa-info-circle"></i> 关于远程组件加载机制
      </h3>
      <div class="space-y-4 text-sm text-blue-900/80 dark:text-blue-200/80">
        <p>
          本系统通过
          <code
            class="bg-white dark:bg-black/20 px-1.5 py-0.5 rounded text-blue-700 dark:text-blue-300 font-mono"
            >{{ REMOTE_COMPONENT_CONFIG_ENDPOINT }}</code
          >
          配置文件定义远程组件库。
        </p>
        <ul class="list-disc pl-5 space-y-2">
          <li>
            <strong>配置加载：</strong> 系统启动时读取 JSON 配置，获取组件库的 URL
            和加载方式（UMD/ESM）。
          </li>
          <li>
            <strong>动态加载：</strong> 通过动态创建 <code>&lt;script&gt;</code> 标签加载 UMD 文件。
          </li>
          <li>
            <strong>元数据提取：</strong>
            加载完成后，系统会自动扫描组件库导出的全局对象，提取以下信息：
            <ul class="list-circle pl-5 mt-1 space-y-1 opacity-90">
              <li><code>manifest</code>: 包含版本、作者、描述等基础信息。</li>
              <li>
                <code>componentsDetailed</code>:
                包含组件名称、显示名称、详细描述等结构化数据（支持直接导出或在 manifest 中包含）。
              </li>
              <li><code>componentsMap</code>: 简单的组件名到描述的映射。</li>
            </ul>
          </li>
        </ul>
        <p class="mt-2 text-xs opacity-70">
          * 如果您的组件库未显示详细信息，请确保在构建时正确导出了
          <code>componentsDetailed</code> 或 <code>manifest</code> 对象。
        </p>
      </div>
    </div>
  </div>
</template>
