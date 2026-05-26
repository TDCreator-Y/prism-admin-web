<script setup lang="ts">
import { computed } from 'vue'
import { useMenuStore } from '../global-menu/store'

const menuStore = useMenuStore()

function escapeSvgText(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const watermarkText = computed(() => menuStore.theme.watermarkText.trim())

const watermarkStyle = computed(() => {
  const color = menuStore.theme.darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.08)'
  const text = escapeSvgText(watermarkText.value)
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="560" height="360" viewBox="0 0 560 360">
      <g transform="rotate(-24 280 180)">
        <text x="48" y="96" fill="${color}" font-size="20" font-family="Arial, sans-serif">${text}</text>
        <text x="316" y="96" fill="${color}" font-size="20" font-family="Arial, sans-serif">${text}</text>
        <text x="182" y="236" fill="${color}" font-size="20" font-family="Arial, sans-serif">${text}</text>
        <text x="450" y="236" fill="${color}" font-size="20" font-family="Arial, sans-serif">${text}</text>
      </g>
    </svg>
  `.trim()

  return {
    backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(svg)}")`,
    backgroundRepeat: 'repeat',
    backgroundSize: '560px 360px',
    backgroundPosition: '0 0',
  }
})

const shouldShow = computed(() => menuStore.theme.showWatermark && watermarkText.value.length > 0)
</script>

<template>
  <div
    v-if="shouldShow"
    aria-hidden="true"
    class="fixed inset-0 z-[60] pointer-events-none select-none"
    :style="watermarkStyle"
  />
</template>
