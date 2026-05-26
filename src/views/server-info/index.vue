<template>
  <div class="flex flex-col gap-6 p-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">服务器信息</h1>
      <button
        class="btn-primary px-4 py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
      >
        <i class="fas fa-sync-alt"></i>
        <span>刷新状态</span>
      </button>
    </div>

    <!-- 服务器运行状态卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- CPU 使用率 -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">CPU 使用率</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">45%</p>
            <p class="text-sm text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
              <i class="fas fa-arrow-down text-xs"></i>
              <span>-2.1%</span>
            </p>
          </div>
          <div
            class="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0"
          >
            <i class="fas fa-microchip text-blue-600 dark:text-blue-400 text-xl"></i>
          </div>
        </div>
      </div>

      <!-- 内存使用率 -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">内存使用率</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">6.2 GB</p>
            <p class="text-sm text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
              <i class="fas fa-arrow-up text-xs"></i>
              <span>+12.5%</span>
            </p>
          </div>
          <div
            class="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0"
          >
            <i class="fas fa-memory text-purple-600 dark:text-purple-400 text-xl"></i>
          </div>
        </div>
      </div>

      <!-- 磁盘使用率 -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">磁盘使用率</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">128 GB</p>
            <p class="text-sm text-gray-400 dark:text-gray-500 mt-2">总容量 512 GB</p>
          </div>
          <div
            class="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0"
          >
            <i class="fas fa-hdd text-emerald-600 dark:text-emerald-400 text-xl"></i>
          </div>
        </div>
      </div>

      <!-- 运行时间 -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">系统运行时间</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">12天 4小时</p>
            <p class="text-sm text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
              <i class="fas fa-check-circle text-xs"></i>
              <span>运行正常</span>
            </p>
          </div>
          <div
            class="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0"
          >
            <i class="fas fa-clock text-amber-600 dark:text-amber-400 text-xl"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- 服务器日志列表 -->
    <div
      class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden flex flex-col flex-1"
    >
      <div
        class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between"
      >
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">系统日志</h3>
        <div class="flex gap-2">
          <button
            class="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors"
          >
            导出日志
          </button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr
              class="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700"
            >
              <th
                class="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-40"
              >
                时间
              </th>
              <th
                class="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24"
              >
                级别
              </th>
              <th
                class="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                消息内容
              </th>
              <th
                class="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-32"
              >
                来源
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="(log, index) in paginatedLogs"
              :key="index"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                {{ log.time }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    getLevelClass(log.level),
                  ]"
                >
                  {{ log.level }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 font-mono text-xs">
                {{ log.message }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                {{ log.source }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页控制 -->
      <div
        v-if="totalPages > 1"
        class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between"
      >
        <span class="text-sm text-gray-500 dark:text-gray-400">
          共 {{ logs.length }} 条，第 {{ currentPage }} / {{ totalPages }} 页
        </span>
        <div class="flex items-center gap-1">
          <button
            class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
            :disabled="currentPage === 1"
            @click="currentPage--"
          >
            上一页
          </button>
          <button
            v-for="page in totalPages"
            :key="page"
            class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            :class="
              page === currentPage
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
            "
            @click="currentPage = page"
          >
            {{ page }}
          </button>
          <button
            class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
            :disabled="currentPage === totalPages"
            @click="currentPage++"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';

  interface LogItem {
    time: string;
    level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
    message: string;
    source: string;
  }

  const logs = ref<LogItem[]>([
    {
      time: '2026-03-10 14:23:45',
      level: 'INFO',
      message: 'System initialization complete. Service started on port 8080.',
      source: 'systemd',
    },
    {
      time: '2026-03-10 14:25:12',
      level: 'WARN',
      message: 'Memory usage exceeded 75% threshold.',
      source: 'monitor',
    },
    {
      time: '2026-03-10 14:28:01',
      level: 'ERROR',
      message: 'Failed to connect to database replica at 192.168.1.105:5432',
      source: 'db-connector',
    },
    {
      time: '2026-03-10 14:30:00',
      level: 'INFO',
      message: 'Scheduled backup task started.',
      source: 'cron',
    },
    {
      time: '2026-03-10 14:30:15',
      level: 'INFO',
      message: 'Backup completed successfully (2.4GB).',
      source: 'backup-service',
    },
    {
      time: '2026-03-10 14:45:22',
      level: 'DEBUG',
      message: 'User session created for user_id=1024',
      source: 'auth-service',
    },
  ]);

  const PAGE_SIZE = 10;
  const currentPage = ref(1);
  const totalPages = computed(() => Math.max(1, Math.ceil(logs.value.length / PAGE_SIZE)));
  const paginatedLogs = computed(() =>
    logs.value.slice((currentPage.value - 1) * PAGE_SIZE, currentPage.value * PAGE_SIZE)
  );

  const getLevelClass = (level: string) => {
    switch (level) {
      case 'INFO':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'WARN':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'ERROR':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'DEBUG':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };
</script>

<style scoped>
  /* 确保表格横向滚动条样式美观 */
  .overflow-x-auto::-webkit-scrollbar {
    height: 6px;
  }
  .overflow-x-auto::-webkit-scrollbar-track {
    background: transparent;
  }
  .overflow-x-auto::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.5);
    border-radius: 3px;
  }
  .overflow-x-auto::-webkit-scrollbar-thumb:hover {
    background-color: rgba(107, 114, 128, 0.8);
  }
</style>
