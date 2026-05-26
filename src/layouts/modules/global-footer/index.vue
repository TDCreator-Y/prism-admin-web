<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 当前年份
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 px-6">
    <div class="flex flex-col md:flex-row items-center justify-between gap-2">
      <!-- 版权信息 -->
      <div class="text-sm text-gray-500 dark:text-gray-400">
        &copy; {{ currentYear }} Dashboard LightWeight. All rights reserved.
      </div>

      <!-- 备案信息 -->
      <div class="text-sm text-gray-400 dark:text-gray-500">
        Powered by Vue 3 + Tailwind CSS
      </div>
    </div>
  </footer>
</template>
