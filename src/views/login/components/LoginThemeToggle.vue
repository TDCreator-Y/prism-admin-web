<script setup lang="ts">
defineProps<{
  isDark: boolean;
}>();

defineEmits<{
  (e: 'toggle'): void;
}>();
</script>

<template>
  <button
    class="theme-toggle"
    :title="isDark ? '切换浅色模式' : '切换深色模式'"
    @click="$emit('toggle')"
  >
    <svg
      v-if="isDark"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
    <svg
      v-else
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        cx="12"
        cy="12"
        r="5"
        stroke="currentColor"
        stroke-width="2"
      />
      <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>
  </button>
</template>

<style scoped>
.theme-toggle {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  background: var(--toggle-bg);
  border: 1px solid var(--toggle-border);
  border-radius: 8px;
  color: var(--toggle-color);
  cursor: pointer;
  transition:
    background 0.2s ease,
    color 0.3s ease,
    border-color 0.3s ease,
    transform 0.2s ease;
}

.theme-toggle:hover {
  background: var(--toggle-hover-bg);
  transform: rotate(15deg) scale(1.05);
}

.theme-toggle svg {
  transition: transform 0.35s ease;
}
</style>
