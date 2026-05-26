import { ref } from 'vue';

export type ToastType = 'success' | 'error' | 'warn' | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

// 模块级单例 — 所有调用方共享同一个队列
const toasts = ref<Toast[]>([]);
let _nextId = 0;

function show(type: ToastType, message: string, duration = 3500) {
  const id = ++_nextId;
  toasts.value.push({ id, type, message });
  window.setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id);
  }, duration);
}

export function useToast() {
  return {
    toasts,
    success: (message: string, duration?: number) => show('success', message, duration),
    error: (message: string, duration?: number) => show('error', message, duration),
    warn: (message: string, duration?: number) => show('warn', message, duration),
    info: (message: string, duration?: number) => show('info', message, duration),
  };
}
