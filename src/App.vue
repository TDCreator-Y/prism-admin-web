<template>
  <!-- 加载遮罩层：动态路由加载完成前显示，但登录页除外 -->
  <div v-if="!isReady && $route.path !== '/login' && $route.path !== '/SpringLogin'" class="app-loading-overlay">
    <div class="app-loading-content">
      <div class="app-loading-spinner"></div>
      <p class="app-loading-text">加载中...</p>
    </div>
  </div>
  <!-- 主应用内容 -->
  <RouterView v-else />

  <!-- 全局 Toast 通知 -->
  <GlobalToast />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { isDynamicRoutesReady } from '@/router'
import GlobalToast from '@/components/global/GlobalToast.vue'

const isReady = ref(false)
let pollInterval: ReturnType<typeof setInterval> | null = null

function clearReadyPoll() {
  if (pollInterval) {
    clearInterval(pollInterval)
    pollInterval = null
  }
}

onMounted(() => {
  // 等待动态路由加载完成
  if (isDynamicRoutesReady()) {
    isReady.value = true
    return
  }

  // 监听动态路由加载完成
  const checkReady = () => {
    if (isDynamicRoutesReady()) {
      isReady.value = true
      clearReadyPoll()
    }
  }

  // 轮询检查（作为备用方案）
  pollInterval = setInterval(checkReady, 50)
})

onUnmounted(() => {
  clearReadyPoll()
})
</script>

<style scoped>
.app-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.app-loading-content {
  text-align: center;
}

.app-loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e4e7ed;
  border-top-color: #409eff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

.app-loading-text {
  color: #909399;
  font-size: 14px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
