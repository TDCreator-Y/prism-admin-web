<script setup lang="ts">
import { useToast } from '@/composables/useToast';

const { toasts } = useToast();
</script>

<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none w-80">
      <TransitionGroup
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 translate-x-8"
        enter-to-class="opacity-100 translate-x-0"
        leave-active-class="transition duration-200 ease-in absolute w-full"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0 translate-x-8"
        move-class="transition duration-200"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg text-sm pointer-events-auto"
          :class="{
            'bg-green-50 dark:bg-green-900/90 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-700':
              toast.type === 'success',
            'bg-red-50 dark:bg-red-900/90 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-700':
              toast.type === 'error',
            'bg-amber-50 dark:bg-amber-900/90 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-700':
              toast.type === 'warn',
            'bg-blue-50 dark:bg-blue-900/90 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700':
              toast.type === 'info',
          }"
        >
          <i
            class="text-base mt-0.5 flex-shrink-0"
            :class="{
              'fas fa-check-circle text-green-500': toast.type === 'success',
              'fas fa-exclamation-circle text-red-500': toast.type === 'error',
              'fas fa-exclamation-triangle text-amber-500': toast.type === 'warn',
              'fas fa-info-circle text-blue-500': toast.type === 'info',
            }"
          />
          <span class="flex-1 leading-relaxed">{{ toast.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>
