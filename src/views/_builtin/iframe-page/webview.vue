<script setup lang="ts">
defineOptions({ inheritAttrs: false })
import { ref, onMounted, onUnmounted, computed, watch, type ComputedRef } from 'vue'
import {
  type IframeReferrerPolicy,
  getIframeSecurityPolicy,
  validateIframeUrl,
} from '@/config/iframe-security'
import { useTeleportManager } from '@/store/modules/teleport-manager'

const props = defineProps<{
  url: string
  pageId: string
  routeQuery?: Record<string, string>
  routeId?: string
  functionId?: string
  backendOrigin?: string
}>()

const emit = defineEmits<{
  (e: 'ready'): void
  (e: 'cleanup'): void
}>()

const { shouldShowPage, updatePageStatus, requestActivation } = useTeleportManager()

const iframeRef = ref<HTMLIFrameElement | null>(null)
const error = ref<string | null>(null)

// 两个布尔状态
const isRendered = ref(false); // 是否已完成首次渲染
const isActive = ref(false);   // 是否当前活动页面

// 定时器引用
let renderTimer: ReturnType<typeof setTimeout> | null = null;

// 完整 URL（处理路由参数拼接）
const fullUrl = computed(() => {
  if (!props.url) return ''
  if (!props.routeQuery || Object.keys(props.routeQuery).length === 0) {
    return props.url
  }
  const params = new URLSearchParams(props.routeQuery)
  const separator = props.url.includes('?') ? '&' : '?'
  return `${props.url}${separator}${params.toString()}`
})

interface IframeSecurityResult {
  src: string
  policyName: 'same-origin' | 'cross-origin'
  sandbox: string
  allow: string
  referrerPolicy?: IframeReferrerPolicy
  error: string | null
}

const iframeSecurityResult = computed<IframeSecurityResult>(() => {
  if (!fullUrl.value) {
    return {
      src: '',
      policyName: 'same-origin' as const,
      sandbox: '',
      allow: '',
      referrerPolicy: undefined,
      error: null as string | null,
    }
  }

  try {
    const validatedUrl = validateIframeUrl(fullUrl.value)
    const securityPolicy = getIframeSecurityPolicy(fullUrl.value)
    return {
      src: validatedUrl.toString(),
      policyName: securityPolicy.name,
      sandbox: securityPolicy.sandbox,
      allow: securityPolicy.allow,
      referrerPolicy: securityPolicy.referrerPolicy,
      error: null as string | null,
    }
  } catch (validationError) {
    return {
      src: '',
      policyName: 'same-origin' as const,
      sandbox: '',
      allow: '',
      referrerPolicy: undefined,
      error:
        validationError instanceof Error ? validationError.message : String(validationError),
    }
  }
})

// 是否有有效的 URL
const hasValidUrl = computed(() => {
  return Boolean(iframeSecurityResult.value.src)
})

const iframeSrc = computed(() => iframeSecurityResult.value.src)
const iframeSandbox = computed(() => iframeSecurityResult.value.sandbox)
const iframeAllow = computed(() => iframeSecurityResult.value.allow)
const iframeReferrerPolicy: ComputedRef<IframeReferrerPolicy | undefined> = computed(
  () => iframeSecurityResult.value.referrerPolicy || undefined
)
const iframePolicyName = computed(() => iframeSecurityResult.value.policyName)

const displayError = computed(() => error.value || iframeSecurityResult.value.error)

// 延迟渲染：300ms 后设置 isRendered=true，再设置 isActive
function delayedRender() {
  // 清除之前的定时器
  if (renderTimer) {
    clearTimeout(renderTimer);
    renderTimer = null;
  }

  renderTimer = setTimeout(() => {
    if (!isRendered.value) {
      isRendered.value = true;
      // 首次渲染完成后，根据是否应该显示来决定 isActive
      isActive.value = shouldShowPage(props.pageId);
      if (isActive.value) {
        updatePageStatus(props.pageId, 'active');
        requestActivation(props.pageId);
      } else {
        updatePageStatus(props.pageId, 'hidden');
      }
      emit('ready');
    }
  }, 300);
}

// iframe 加载完成
function handleIframeLoad() {
  updatePageStatus(props.pageId, 'ready')
}

function handleIframeError() {
  error.value = '页面加载失败'
  updatePageStatus(props.pageId, 'ready')
}

// 清理函数：彻底销毁组件
function cleanup() {
  // 清除定时器
  if (renderTimer) {
    clearTimeout(renderTimer);
    renderTimer = null;
  }

  // 先设 src 为 about:blank，避免网络活动残留
  if (iframeRef.value) {
    iframeRef.value.src = 'about:blank'
  }

  isRendered.value = false;
  isActive.value = false;
  emit('cleanup');
}

// 监听显示状态变化
watch(
  () => shouldShowPage(props.pageId),
  show => {
    // 如果还没渲染，等渲染完成后再处理
    if (!isRendered.value) {
      return;
    }
    isActive.value = show;
    if (show) {
      updatePageStatus(props.pageId, 'active');
      requestActivation(props.pageId);
    } else {
      updatePageStatus(props.pageId, 'hidden');
    }
  },
  { immediate: true }
);

watch(
  () => [isRendered.value, hasValidUrl.value, displayError.value] as const,
  ([rendered, validUrl, currentError]) => {
    if (!rendered) return
    if (!validUrl || currentError) {
      updatePageStatus(props.pageId, 'ready')
    }
  },
  { immediate: true }
)

onMounted(() => {
  updatePageStatus(props.pageId, 'loading');
  // 延迟渲染，确保 DOM 就绪
  delayedRender();
});

onUnmounted(() => {
  cleanup();
});

defineExpose({
  cleanup,
});
</script>

<template>
  <Teleport to="#teleport-root">
    <!-- v-if 控制首次渲染，v-show 控制显示切换 -->
    <div
      v-if="isRendered"
      v-show="isActive"
      class="webview-container"
      :data-page-id="pageId"
    >
      <!-- 有效 URL 的 iframe 渲染 -->
      <iframe
        v-if="hasValidUrl && !displayError"
        ref="iframeRef"
        :src="iframeSrc"
        class="webview-iframe"
        :data-security-profile="iframePolicyName"
        :sandbox="iframeSandbox"
        :allow="iframeAllow"
        :referrerpolicy="iframeReferrerPolicy"
        @load="handleIframeLoad"
        @error="handleIframeError"
      />
      <div v-else-if="displayError" class="webview-error">
        <p>{{ displayError }}</p>
        <p>URL: {{ fullUrl }}</p>
      </div>

      <!-- 无有效 URL 时的占位内容 -->
      <div
        v-else-if="!hasValidUrl"
        class="webview-placeholder"
      >
        <div class="placeholder-content">
          <div class="placeholder-icon">
            <i class="fas fa-puzzle-piece" />
          </div>
          <h3 class="placeholder-title">{{ routeId || functionId || '页面' }}</h3>
          <p class="placeholder-desc">
            <template v-if="functionId">
              <template v-if="functionId.startsWith('http')">
                外部链接页面
              </template>
              <template v-else-if="functionId.endsWith('.vue')">
                远程 Vue 组件
              </template>
              <template v-else>
                占位页面（未配置 URL）
              </template>
            </template>
            <template v-else>
              占位页面（未配置 URL）
            </template>
          </p>
          <p v-if="url" class="placeholder-url">URL: {{ url }}</p>
          <p v-else class="placeholder-hint">请在菜单配置中设置页面地址</p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.webview-container {
  pointer-events: auto;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.webview-iframe {
  width: 100%;
  height: 100%;
  border: none;
  background-color: #fff;
}

.webview-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #f56c6c;
  font-size: 14px;
}

.webview-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: #f5f7fa;
  pointer-events: auto;
}

.placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  padding: 40px 20px;
  text-align: center;
}

.placeholder-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.placeholder-icon i {
  font-size: 36px;
  color: #909399;
}

.placeholder-title {
  font-size: 24px;
  font-weight: 500;
  color: #303133;
  margin: 0 0 12px 0;
}

.placeholder-desc {
  font-size: 14px;
  color: #909399;
  margin: 0 0 8px 0;
}

.placeholder-url {
  font-size: 12px;
  color: #c0c4cc;
  word-break: break-all;
  margin: 0;
}

.placeholder-hint {
  font-size: 13px;
  color: #e6a23c;
  margin: 0;
}
</style>
