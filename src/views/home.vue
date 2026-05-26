<script setup lang="ts">
// 首页
</script>

<template>
  <div class="space-y-6" data-testid="home-page">
    <!-- 欢迎卡片 -->
    <div
      class="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-900 dark:to-gray-800 rounded-xl p-6 text-white"
      data-testid="home-hero"
    >
      <h1 class="text-2xl font-bold mb-2">欢迎使用 Dashboard LightWeight</h1>
      <p class="text-blue-100 dark:text-blue-200">一个现代化的 Vue 3 + Tailwind CSS 中后台管理模板</p>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">总用户数</p>
            <p class="text-2xl font-bold text-gray-800 dark:text-white">12,345</p>
          </div>
          <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <i class="fas fa-users text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <p class="mt-2 text-sm text-green-600">
          <i class="fas fa-arrow-up" />
          <span>12% 较上周</span>
        </p>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">总订单数</p>
            <p class="text-2xl font-bold text-gray-800 dark:text-white">8,234</p>
          </div>
          <div class="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <i class="fas fa-shopping-cart text-green-600 dark:text-green-400" />
          </div>
        </div>
        <p class="mt-2 text-sm text-green-600">
          <i class="fas fa-arrow-up" />
          <span>8% 较上周</span>
        </p>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">总收入</p>
            <p class="text-2xl font-bold text-gray-800 dark:text-white">¥ 98,765</p>
          </div>
          <div class="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
            <i class="fas fa-yen-sign text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>
        <p class="mt-2 text-sm text-green-600">
          <i class="fas fa-arrow-up" />
          <span>15% 较上周</span>
        </p>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">待处理</p>
            <p class="text-2xl font-bold text-gray-800 dark:text-white">123</p>
          </div>
          <div class="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <i class="fas fa-clock text-red-600 dark:text-red-400" />
          </div>
        </div>
        <p class="mt-2 text-sm text-red-600">
          <i class="fas fa-arrow-up" />
          <span>3% 较上周</span>
        </p>
      </div>
    </div>

    <!-- 最近活动 -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <h2 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">最近活动</h2>
      <div class="space-y-4">
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
            <i class="fas fa-user-plus text-blue-600 dark:text-blue-400" />
          </div>
          <div class="flex-1">
            <p class="text-sm text-gray-800 dark:text-white">新用户注册</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">用户「张三」完成了注册</p>
            <p class="text-xs text-gray-400 mt-1">2分钟前</p>
          </div>
        </div>
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
            <i class="fas fa-check text-green-600 dark:text-green-400" />
          </div>
          <div class="flex-1">
            <p class="text-sm text-gray-800 dark:text-white">订单完成</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">订单 #12345 已完成</p>
            <p class="text-xs text-gray-400 mt-1">5分钟前</p>
          </div>
        </div>
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center flex-shrink-0">
            <i class="fas fa-comment text-yellow-600 dark:text-yellow-400" />
          </div>
          <div class="flex-1">
            <p class="text-sm text-gray-800 dark:text-white">新评论</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">您的文章收到了一条新评论</p>
            <p class="text-xs text-gray-400 mt-1">10分钟前</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
