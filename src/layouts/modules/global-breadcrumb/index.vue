<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMenuStore } from '../global-menu/store'
import { useAppOpenTab } from '@/composables/useAppOpenTab'

const menuStore = useMenuStore()
const route = useRoute()
const router = useRouter()
const { openPath } = useAppOpenTab()

// 面包屑列表
const breadcrumbs = computed(() => menuStore.breadcrumbs)

// 容器宽度检测
const containerRef = ref<HTMLElement | null>(null)
const isOverflow = ref(false)
const showDropdown = ref(false)

function checkOverflow() {
  if (!containerRef.value) return
  const { scrollWidth, clientWidth } = containerRef.value
  isOverflow.value = scrollWidth > clientWidth
}

function handleResize() {
  checkOverflow()
}

// 跳转到指定路径
async function navigateTo(path: string) {
  showDropdown.value = false
  await openPath(path)
}

function toggleDropdown() {
  showDropdown.value = !showDropdown.value
}

function handleClickOutside(e: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    showDropdown.value = false
  }
}

onMounted(() => {
  checkOverflow()
  window.addEventListener('resize', handleResize)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <nav
    ref="containerRef"
    data-testid="breadcrumb"
    class="flex items-center gap-2 text-sm min-w-0 relative"
  >
    <template v-if="isOverflow">
      <!-- 省略号下拉菜单 -->
      <div class="relative">
        <span
          class="text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
          @click.stop="toggleDropdown"
        >
          <i class="fas fa-ellipsis-h" />
        </span>
        <!-- 下拉菜单 -->
        <Transition
          enter-active-class="transition ease-out duration-200"
          enter-from-class="opacity-0 translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition ease-in duration-150"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 translate-y-1"
        >
          <div
            v-if="showDropdown"
            class="absolute left-0 top-full mt-1 min-w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
          >
            <template v-for="item in breadcrumbs.slice(0, -1)" :key="item.path">
              <button
                class="flex items-center gap-2 px-4 py-2 text-sm cursor-pointer transition-colors whitespace-nowrap w-full text-left"
                :class="[
                  'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                ]"
                @click="navigateTo(item.path)"
              >
                <i v-if="item.icon" :class="['fas', item.icon]" />
                <span>{{ item.title }}</span>
              </button>
            </template>
          </div>
        </Transition>
      </div>
      <i class="fas fa-chevron-right text-gray-300 dark:text-gray-600 text-xs" />
    </template>

    <template v-else>
      <!-- 正常显示所有面包屑 -->
      <template v-for="(item, index) in breadcrumbs" :key="item.path">
        <!-- 可点击的面包屑（非最后一项） -->
        <template v-if="index < breadcrumbs.length - 1">
          <button
            class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors truncate max-w-40"
            @click="navigateTo(item.path)"
          >
            <i v-if="item.icon" :class="['fas', item.icon, 'mr-1']" />
            {{ item.title }}
          </button>
          <i class="fas fa-chevron-right text-gray-300 dark:text-gray-600 text-xs flex-shrink-0" />
        </template>

        <!-- 当前页（最后一项） -->
        <template v-else>
          <span class="text-gray-800 dark:text-white font-medium truncate">
            <i v-if="item.icon" :class="['fas', item.icon, 'mr-1']" />
            {{ item.title }}
          </span>
        </template>
      </template>
    </template>

    <!-- 当前页始终显示 -->
    <span
      v-if="isOverflow"
      class="text-gray-800 dark:text-white font-medium truncate"
    >
      <i v-if="breadcrumbs[breadcrumbs.length - 1]?.icon" :class="['fas', breadcrumbs[breadcrumbs.length - 1].icon, 'mr-1']" />
      {{ breadcrumbs[breadcrumbs.length - 1]?.title }}
    </span>
  </nav>
</template>
