import { onUnmounted } from 'vue';

/**
 * 将 AbortController 绑定到 Vue 组件生命周期。
 *
 * 调用 newSignal() 前会自动取消上一个未完成的请求，
 * onUnmounted 时自动取消所有进行中的请求，防止内存泄漏和陈旧数据写入。
 */
export function useCancellableRequest() {
  let controller: AbortController | null = null;

  function cancel() {
    controller?.abort();
    controller = null;
  }

  /** 取消上一个请求并返回新的 AbortSignal */
  function newSignal(): AbortSignal {
    cancel();
    controller = new AbortController();
    return controller.signal;
  }

  onUnmounted(cancel);

  return { newSignal, cancel };
}
