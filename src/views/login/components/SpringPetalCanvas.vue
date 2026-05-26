<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

interface Petal {
  x: number;
  y: number;
  s: number;
  vx: number;
  vy: number;
  angle: number;
  va: number;
  sway: number;
  swaySpeed: number;
  swayOffset: number;
  colorIdx: number;
  opacity: number;
}

const canvasRef = ref<HTMLCanvasElement | null>(null);

const PETAL_COLORS = ['#FFB7C5', '#FF8FAB', '#FFD6E0', '#FFE4EA', 'rgba(255,255,255,0.8)'];
const PETAL_COUNT = 55;
const FRAME_INTERVAL = 33;

let petals: Petal[] = [];
let rafId: number | null = null;
let cleanupCanvas: (() => void) | null = null;

function makePetal(canvas: HTMLCanvasElement, fromTop = false): Petal {
  return {
    x: Math.random() * canvas.width,
    y: fromTop ? -20 - Math.random() * canvas.height : -20 - Math.random() * 60,
    s: 6 + Math.random() * 9,
    vx: (Math.random() - 0.5) * 0.6,
    vy: 0.35 + Math.random() * 0.75,
    angle: Math.random() * Math.PI * 2,
    va: (Math.random() - 0.5) * 0.025,
    sway: 0.5 + Math.random() * 1.1,
    swaySpeed: 0.008 + Math.random() * 0.012,
    swayOffset: Math.random() * Math.PI * 2,
    colorIdx: Math.floor(Math.random() * PETAL_COLORS.length),
    opacity: 0.7 + Math.random() * 0.3,
  };
}

function drawPetal(ctx: CanvasRenderingContext2D, petal: Petal) {
  ctx.save();
  ctx.translate(petal.x, petal.y);
  ctx.rotate(petal.angle);
  ctx.globalAlpha = petal.opacity;
  ctx.fillStyle = PETAL_COLORS[petal.colorIdx];
  ctx.beginPath();
  const size = petal.s;
  ctx.moveTo(0, -size);
  ctx.bezierCurveTo(size * 0.65, -size * 0.45, size * 0.65, size * 0.45, 0, size);
  ctx.bezierCurveTo(-size * 0.65, size * 0.45, -size * 0.65, -size * 0.45, 0, -size);
  ctx.closePath();
  ctx.fill();

  ctx.globalAlpha = petal.opacity * 0.3;
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.8);
  ctx.lineTo(0, size * 0.8);
  ctx.stroke();
  ctx.restore();
}

function initCanvas(canvas: HTMLCanvasElement) {
  const context = canvas.getContext('2d');
  if (!context) return () => {};
  const ctx = context;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  petals = Array.from({ length: PETAL_COUNT }, () => makePetal(canvas, true));

  let frameTime = 0;

  function draw(timestamp: number) {
    rafId = requestAnimationFrame(draw);
    if (timestamp - frameTime < FRAME_INTERVAL) return;
    frameTime = timestamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const petal of petals) {
      petal.swayOffset += petal.swaySpeed;
      petal.x += petal.vx + Math.sin(petal.swayOffset) * petal.sway;
      petal.y += petal.vy;
      petal.angle += petal.va;

      if (petal.y > canvas.height + 30) {
        Object.assign(petal, makePetal(canvas, false));
      }

      drawPetal(ctx, petal);
    }
  }

  rafId = requestAnimationFrame(draw);

  return () => window.removeEventListener('resize', resize);
}

onMounted(() => {
  if (canvasRef.value) {
    cleanupCanvas = initCanvas(canvasRef.value);
  }
});

onUnmounted(() => {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
  }
  cleanupCanvas?.();
});
</script>

<template>
  <canvas
    ref="canvasRef"
    class="petal-canvas"
  />
</template>

<style scoped>
.petal-canvas {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
</style>
