<script setup lang="ts">
defineProps<{ label: string; modelValue: boolean }>();
defineEmits<{ (e: 'update:modelValue', value: boolean): void }>();
</script>

<template>
  <label class="flex items-center justify-between cursor-pointer">
    <span class="text-sm text-gray-600 dark:text-gray-400">{{ label }}</span>
    <div
      class="relative w-11 h-6 rounded-full transition-colors cursor-pointer"
      :class="modelValue ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'"
      @click="$emit('update:modelValue', !modelValue)"
    >
      <div
        class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform"
        :class="modelValue ? 'translate-x-5' : 'translate-x-0'"
      />
    </div>
  </label>
</template>
