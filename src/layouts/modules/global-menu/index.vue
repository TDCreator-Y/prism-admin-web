<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useMenuStore } from './store'
import type { MenuItem } from './types'
import { useAppOpenTab } from '@/composables/useAppOpenTab'

// 递归组件定义
defineOptions({
  name: 'GlobalMenuItem'
})

const props = defineProps<{
  menu: MenuItem[]
  collapsed?: boolean
  activePath?: string
}>()

const emit = defineEmits<{
  (e: 'select', item: MenuItem): void
}>()

const route = useRoute()
const menuStore = useMenuStore()
const { openPath } = useAppOpenTab()

const selectedKey = computed(() => props.activePath || route.path)
const openKeys = computed(() => menuStore.openKeys)

// 当前 hover 的一级菜单
const hoveredKey = ref<string | null>(null)
// 当前 hover 的二级菜单
const subHoveredKey = ref<string | null>(null)

const VIEWPORT_PADDING = 12
const ROOT_DROPDOWN_WIDTH = 256
const SUB_DROPDOWN_WIDTH = 240
const DROPDOWN_OFFSET = 8
const DROPDOWN_MIN_HEIGHT = 220

// 延迟关闭时间（毫秒）
const closeDelay = 200
let closeTimer: ReturnType<typeof setTimeout> | null = null

function hasChildren(item: MenuItem): boolean {
  return !!(item.children && item.children.length > 0)
}

function isOpen(key: string): boolean {
  return openKeys.value.includes(key)
}

function toggleOpen(key: string, e: Event) {
  e.preventDefault()
  e.stopPropagation()
  menuStore.toggleOpenKey(key)
}

async function handleSelect(item: MenuItem) {
  emit('select', item)
  await openPath(item.path)
}

// 判断是否是 hover 的一级菜单
function isHovered(key: string): boolean {
  return hoveredKey.value === key && props.collapsed
}

// 判断是否是 hover 的二级菜单
function isSubHovered(key: string): boolean {
  return subHoveredKey.value === key && props.collapsed
}

// 鼠标进入一级菜单 - 展开子菜单
function handleMouseEnter(key: string) {
  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = null
  }
  hoveredKey.value = key
  // Bug fix: 混合模式下侧边栏展示的是子菜单，key 不在 menuStore.menuList 顶层，
  // 改为在 props.menu 中查找，避免 find 返回 undefined 导致 TypeError
  if (props.collapsed) {
    const item = props.menu.find(i => i.key === key)
    if (item && hasChildren(item)) {
      menuStore.openKey(key)
    }
  }
}

// 鼠标进入二级菜单 - 展开三级子菜单
function handleSubMouseEnter(key: string) {
  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = null
  }
  subHoveredKey.value = key
}

// 鼠标离开菜单区域 - 延迟关闭
function handleMouseLeave() {
  if (closeTimer) {
    clearTimeout(closeTimer)
  }
  closeTimer = setTimeout(() => {
    hoveredKey.value = null
    subHoveredKey.value = null
    resetDropdownPosition()
    if (props.collapsed) {
      menuStore.closeAllKeys()
    }
  }, closeDelay)
}

// 清除延迟关闭定时器
function cancelCloseTimer() {
  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = null
  }
}

type DropdownPosition = {
  left: string
  maxWidth: string
  maxHeight: string
  top?: string
  bottom?: string
}

// 下拉菜单位置状态
const dropdownPosition = ref<DropdownPosition | null>(null)
const subDropdownPosition = ref<DropdownPosition | null>(null)

function getClampedLeft(left: number, width: number) {
  return Math.max(
    VIEWPORT_PADDING,
    Math.min(left, window.innerWidth - width - VIEWPORT_PADDING)
  )
}

function getVerticalPosition(rect: DOMRect, minHeight = DROPDOWN_MIN_HEIGHT) {
  const spaceAbove = rect.top - VIEWPORT_PADDING
  const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_PADDING
  const alignTop = spaceBelow >= minHeight || spaceBelow >= spaceAbove
  const availableHeight = Math.max(160, (alignTop ? spaceBelow : spaceAbove) + rect.height)

  if (alignTop) {
    return {
      top: `${Math.max(VIEWPORT_PADDING, rect.top)}px`,
      bottom: undefined,
      maxHeight: `${availableHeight}px`
    }
  }

  return {
    top: undefined,
    bottom: `${Math.max(VIEWPORT_PADDING, window.innerHeight - rect.bottom)}px`,
    maxHeight: `${availableHeight}px`
  }
}

// 获取下拉菜单位置（left 对齐 aside 右边线，并限制在可视区域内）
function updateDropdownPosition(event: MouseEvent) {
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const aside = target.closest('aside')
  const asideLeft = aside ? aside.getBoundingClientRect().left : 0
  const siderWidth = props.collapsed ? 72 : 220
  const left = getClampedLeft(asideLeft + siderWidth + DROPDOWN_OFFSET, ROOT_DROPDOWN_WIDTH)
  const verticalPosition = getVerticalPosition(rect, 260)

  dropdownPosition.value = {
    left: `${left}px`,
    maxWidth: `${Math.max(220, window.innerWidth - left - VIEWPORT_PADDING)}px`,
    maxHeight: verticalPosition.maxHeight,
    top: verticalPosition.top,
    bottom: verticalPosition.bottom
  }
}

function updateSubDropdownPosition(event: MouseEvent) {
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()

  let left = rect.right + DROPDOWN_OFFSET
  if (left + SUB_DROPDOWN_WIDTH > window.innerWidth - VIEWPORT_PADDING) {
    left = rect.left - SUB_DROPDOWN_WIDTH - DROPDOWN_OFFSET
  }
  left = getClampedLeft(left, SUB_DROPDOWN_WIDTH)
  const verticalPosition = getVerticalPosition(rect, 220)

  subDropdownPosition.value = {
    left: `${left}px`,
    maxWidth: `${Math.max(200, window.innerWidth - left - VIEWPORT_PADDING)}px`,
    maxHeight: verticalPosition.maxHeight,
    top: verticalPosition.top,
    bottom: verticalPosition.bottom
  }
}

// 重置下拉菜单位置
function resetDropdownPosition() {
  dropdownPosition.value = null
  subDropdownPosition.value = null
}
</script>

<template>
  <ul class="space-y-1">
    <template v-for="item in menu" :key="item.key">
      <!-- 无子菜单的菜单项 -->
      <li v-if="!hasChildren(item)" class="relative">
        <button
          data-testid="menu-item"
          :data-menu-key="item.key"
          :data-menu-path="item.path"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors w-full"
          :class="[
            collapsed ? 'justify-center' : 'text-left',
            selectedKey === item.path
              ? 'bg-primary-bg text-primary font-medium'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
          ]"
          @click="handleSelect(item)"
          @mouseenter="handleMouseEnter(item.key); updateDropdownPosition($event)"
          @mouseleave="handleMouseLeave"
        >
          <i v-if="item.icon" :class="['fas', item.icon, 'w-5 h-5 flex-shrink-0']" />
          <span v-if="!collapsed" class="flex flex-col min-w-0">
            <span class="truncate">{{ item.title }}</span>
            <span v-if="item.description" class="text-xs text-gray-400 dark:text-gray-500 truncate leading-4 mt-0.5 font-normal">{{ item.description }}</span>
          </span>
        </button>

        <!-- 折叠状态下的菜单名称 tooltip -->
        <Transition
          enter-active-class="transition-[opacity,transform] duration-150 ease-out"
          enter-from-class="opacity-0 -translate-x-2"
          enter-to-class="opacity-100 translate-x-0"
          leave-active-class="transition-[opacity,transform] duration-100 ease-in"
          leave-from-class="opacity-100 translate-x-0"
          leave-to-class="opacity-0 -translate-x-2"
        >
          <div
            v-if="collapsed && isHovered(item.key)"
            class="fixed z-[999] min-w-[12rem] max-w-[20rem] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 leading-5 break-all pointer-events-none"
            :style="dropdownPosition ? { top: dropdownPosition.top, bottom: dropdownPosition.bottom, left: dropdownPosition.left, maxWidth: dropdownPosition.maxWidth } : {}"
          >
            {{ item.title }}
          </div>
        </Transition>
      </li>

      <!-- 有子菜单的菜单项 -->
      <li v-else class="relative">
        <!-- 父级菜单 - 折叠时不可点击，展开时点击展开/收起 -->
        <button
          data-testid="menu-item"
          :data-menu-key="item.key"
          :data-menu-path="item.path"
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
          :class="[
            collapsed ? 'justify-center' : 'text-left',
            selectedKey.startsWith(item.path)
              ? 'bg-primary-bg text-primary font-medium'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
          ]"
          :title="item.title"
          @click="collapsed ? undefined : toggleOpen(item.key, $event)"
          @mouseenter="handleMouseEnter(item.key); updateDropdownPosition($event)"
          @mouseleave="handleMouseLeave"
        >
          <i v-if="item.icon" :class="['fas', item.icon, 'w-5 h-5 flex-shrink-0']" />
          <template v-if="!collapsed">
            <span class="flex-1 truncate">{{ item.title }}</span>
            <i
              class="fas fa-chevron-down text-xs transition-transform duration-200"
              :class="{ 'rotate-180': isOpen(item.key) }"
            />
          </template>
          <template v-else>
            <span class="sr-only">{{ item.title }}</span>
          </template>
        </button>

        <!-- 折叠状态下的 hover 下拉面板 -->
        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 -translate-x-2"
          enter-to-class="opacity-100 translate-x-0"
          leave-active-class="transition-all duration-150 ease-in"
          leave-from-class="opacity-100 translate-x-0"
          leave-to-class="opacity-0 -translate-x-2"
        >
          <div
            v-if="collapsed && isHovered(item.key)"
            class="fixed z-[999] min-w-[14rem] max-w-[20rem] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 pb-1 overflow-y-auto overflow-x-hidden"
            :style="dropdownPosition ? { top: dropdownPosition.top, bottom: dropdownPosition.bottom, left: dropdownPosition.left, maxWidth: dropdownPosition.maxWidth, maxHeight: dropdownPosition.maxHeight } : {}"
            @mouseenter="cancelCloseTimer"
            @mouseleave="handleMouseLeave"
          >
            <!-- 父级标题 -->
            <div class="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
              {{ item.title }}
            </div>
            <!-- 子菜单列表 -->
            <div class="py-1">
              <template v-for="child in item.children" :key="child.key">
                <!-- 无三级子菜单的二级菜单 -->
                <button
                  v-if="!hasChildren(child)"
                  data-testid="menu-item"
                  :data-menu-key="child.key"
                  :data-menu-path="child.path"
                  class="w-full flex items-start gap-2 px-3 py-2 text-sm transition-colors mx-1 rounded text-left"
                  :class="[
                    selectedKey === child.path
                      ? 'bg-primary-bg text-primary font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                  ]"
                  :title="child.title"
                  @click="handleSelect(child)"
                >
                  <i v-if="child.icon" :class="['fas', child.icon, 'w-4 h-4 flex-shrink-0 mt-0.5']" />
                  <span class="flex flex-col flex-1 min-w-0">
                    <span class="whitespace-normal break-all leading-5">{{ child.title }}</span>
                    <span v-if="child.description" class="text-xs text-gray-400 dark:text-gray-500 leading-4 mt-0.5">{{ child.description }}</span>
                  </span>
                </button>
                <!-- 有三级子菜单的二级菜单 -->
                <div
                  v-else
                  class="relative"
                  @mouseenter="handleSubMouseEnter(child.key); updateSubDropdownPosition($event)"
                  @mouseleave="handleMouseLeave"
                >
                  <button
                    data-testid="menu-item"
                    :data-menu-key="child.key"
                    :data-menu-path="child.path"
                    class="w-full flex items-start gap-2 px-3 py-2 text-sm transition-colors mx-1 rounded text-left"
                    :class="[
                      selectedKey.startsWith(child.path)
                        ? 'bg-primary-bg text-primary font-medium'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                    ]"
                    :title="child.title"
                  >
                    <i v-if="child.icon" :class="['fas', child.icon, 'w-4 h-4 flex-shrink-0']" />
                    <span class="flex-1 whitespace-normal break-all leading-5">{{ child.title }}</span>
                    <i class="fas fa-chevron-right text-xs opacity-50 mt-1 flex-shrink-0" />
                  </button>
                  <!-- 三级子菜单下拉面板 -->
                  <Transition
                    enter-active-class="transition-all duration-200 ease-out"
                    enter-from-class="opacity-0 translate-x-1"
                    enter-to-class="opacity-100 translate-x-0"
                    leave-active-class="transition-all duration-150 ease-in"
                    leave-from-class="opacity-100 translate-x-0"
                    leave-to-class="opacity-0 translate-x-1"
                  >
                    <div
                      v-if="isSubHovered(child.key)"
                      class="fixed z-[999] min-w-[13rem] max-w-[20rem] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 pb-1 overflow-y-auto overflow-x-hidden"
                      :style="subDropdownPosition ? { top: subDropdownPosition.top, bottom: subDropdownPosition.bottom, left: subDropdownPosition.left, maxWidth: subDropdownPosition.maxWidth, maxHeight: subDropdownPosition.maxHeight } : {}"
                      @mouseenter="cancelCloseTimer"
                      @mouseleave="handleMouseLeave"
                    >
                      <!-- 三级子菜单列表 -->
                      <div class="py-1">
                        <div class="px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
                          {{ child.title }}
                        </div>
                        <button
                          v-for="subChild in child.children"
                          :key="subChild.key"
                          data-testid="menu-item"
                          :data-menu-key="subChild.key"
                          :data-menu-path="subChild.path"
                          class="w-full flex items-start gap-2 px-3 py-2 text-sm transition-colors mx-1 rounded text-left"
                          :class="[
                            selectedKey === subChild.path
                              ? 'bg-primary-bg text-primary font-medium'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                          ]"
                          :title="subChild.title"
                          @click="handleSelect(subChild)"
                        >
                          <i v-if="subChild.icon" :class="['fas', subChild.icon, 'w-3.5 h-3.5 flex-shrink-0']" />
                          <span class="flex-1 whitespace-normal break-all leading-5">{{ subChild.title }}</span>
                        </button>
                      </div>
                    </div>
                  </Transition>
                </div>
              </template>
            </div>
          </div>
        </Transition>

        <!-- 展开状态下的子菜单 -->
        <Transition
          enter-active-class="transition-[opacity,transform] duration-200 ease-out"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-[opacity,transform] duration-150 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-2"
        >
          <div v-if="!collapsed && isOpen(item.key)" class="ml-4 mt-1 space-y-1">
            <GlobalMenuItem
              :menu="item.children || []"
              :collapsed="collapsed"
              @select="emit('select', $event)"
            />
          </div>
        </Transition>
      </li>
    </template>
  </ul>
</template>
