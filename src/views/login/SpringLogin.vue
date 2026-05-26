<script setup lang="ts">
import { ref } from 'vue';
import { AUTH_LOGIN_ENDPOINT } from '@/config/api-endpoints';
import SpringPetalCanvas from './components/SpringPetalCanvas.vue';
import { useLoginSubmit } from './composables/useLoginSubmit';

const showPassword = ref(false);
const passwordFocused = ref(false);
const { form, isLoading, errorMsg, handleLogin } = useLoginSubmit({
  async requestHandler(credentials) {
    const res = await fetch(AUTH_LOGIN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!res.ok) throw new Error(`登录请求失败: ${res.statusText}`);
    const data = await res.json();
    console.log('登录成功:', data);
    return data;
  },
});
</script>

<template>
  <div class="page">
    <!-- Falling petals canvas -->
    <SpringPetalCanvas />

    <!-- Login card -->
    <div class="card">
      <!-- Cherry blossom branch decoration strip -->
      <div class="deco-strip">
        <svg
          viewBox="0 0 400 72"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="72"
        >
          <defs>
            <linearGradient id="l1-strip-bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#ffe0ea" />
              <stop offset="50%" stop-color="#ffd6e5" />
              <stop offset="100%" stop-color="#fceef5" />
            </linearGradient>
            <radialGradient id="l1-bloom-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#ffb7c5" stop-opacity="0.5" />
              <stop offset="100%" stop-color="#ffb7c5" stop-opacity="0" />
            </radialGradient>
          </defs>
          <!-- Background fill -->
          <rect width="400" height="72" fill="url(#l1-strip-bg)" />
          <!-- Soft ambient glows -->
          <ellipse cx="80" cy="36" rx="55" ry="36" fill="url(#l1-bloom-glow)" />
          <ellipse cx="250" cy="20" rx="45" ry="30" fill="url(#l1-bloom-glow)" />
          <ellipse cx="360" cy="50" rx="40" ry="28" fill="url(#l1-bloom-glow)" />

          <!-- Main branch path -->
          <path
            d="M-10 65 C40 55, 80 45, 120 30 C155 17, 185 8, 230 18 C275 28, 310 14, 360 5 C385 0, 400 2, 420 0"
            stroke="#C87B8A"
            stroke-width="3.5"
            fill="none"
            stroke-linecap="round"
          />
          <!-- Secondary branch -->
          <path
            d="M120 30 C135 22, 148 10, 160 4"
            stroke="#C87B8A"
            stroke-width="2.2"
            fill="none"
            stroke-linecap="round"
          />
          <!-- Tertiary branch -->
          <path
            d="M230 18 C240 10, 255 4, 268 2"
            stroke="#C87B8A"
            stroke-width="1.8"
            fill="none"
            stroke-linecap="round"
          />

          <!-- Flower 1 at ~(120,30) -->
          <g transform="translate(120,28)">
            <ellipse cx="0" cy="-9" rx="4.5" ry="8.5" fill="#FFB7C5" transform="rotate(0)" />
            <ellipse cx="0" cy="-9" rx="4.5" ry="8.5" fill="#FFB7C5" transform="rotate(72)" />
            <ellipse cx="0" cy="-9" rx="4.5" ry="8.5" fill="#FF8FAB" transform="rotate(144)" />
            <ellipse cx="0" cy="-9" rx="4.5" ry="8.5" fill="#FFB7C5" transform="rotate(216)" />
            <ellipse cx="0" cy="-9" rx="4.5" ry="8.5" fill="#FF8FAB" transform="rotate(288)" />
            <circle cx="0" cy="0" r="4" fill="#FFF0F5" />
            <circle cx="0" cy="0" r="2" fill="#FFD6E0" />
          </g>

          <!-- Flower 2 at ~(230,18) -->
          <g transform="translate(232,16)">
            <ellipse cx="0" cy="-8.5" rx="4" ry="8" fill="#FF8FAB" transform="rotate(0)" />
            <ellipse cx="0" cy="-8.5" rx="4" ry="8" fill="#FFB7C5" transform="rotate(72)" />
            <ellipse cx="0" cy="-8.5" rx="4" ry="8" fill="#FF8FAB" transform="rotate(144)" />
            <ellipse cx="0" cy="-8.5" rx="4" ry="8" fill="#FFD6E0" transform="rotate(216)" />
            <ellipse cx="0" cy="-8.5" rx="4" ry="8" fill="#FFB7C5" transform="rotate(288)" />
            <circle cx="0" cy="0" r="3.5" fill="#FFF0F5" />
            <circle cx="0" cy="0" r="1.8" fill="#FFB7C5" />
          </g>

          <!-- Flower 3 at ~(360,5) -->
          <g transform="translate(355,8)">
            <ellipse cx="0" cy="-7.5" rx="3.5" ry="7" fill="#FFD6E0" transform="rotate(0)" />
            <ellipse cx="0" cy="-7.5" rx="3.5" ry="7" fill="#FF8FAB" transform="rotate(72)" />
            <ellipse cx="0" cy="-7.5" rx="3.5" ry="7" fill="#FFB7C5" transform="rotate(144)" />
            <ellipse cx="0" cy="-7.5" rx="3.5" ry="7" fill="#FFD6E0" transform="rotate(216)" />
            <ellipse cx="0" cy="-7.5" rx="3.5" ry="7" fill="#FF8FAB" transform="rotate(288)" />
            <circle cx="0" cy="0" r="3" fill="#FFF8FA" />
            <circle cx="0" cy="0" r="1.5" fill="#FFB7C5" />
          </g>

          <!-- Scattered single petals -->
          <ellipse cx="55" cy="42" rx="4" ry="7.5" fill="#FFB7C5" opacity="0.7" transform="rotate(-30, 55, 42)" />
          <ellipse cx="170" cy="55" rx="3.5" ry="6.5" fill="#FF8FAB" opacity="0.6" transform="rotate(45, 170, 55)" />
          <ellipse cx="290" cy="38" rx="3" ry="5.5" fill="#FFD6E0" opacity="0.65" transform="rotate(-15, 290, 38)" />
          <ellipse cx="330" cy="60" rx="3.5" ry="6" fill="#FFB7C5" opacity="0.55" transform="rotate(60, 330, 60)" />
          <ellipse cx="20" cy="30" rx="3" ry="5.5" fill="#FF8FAB" opacity="0.5" transform="rotate(20, 20, 30)" />
          <ellipse cx="195" cy="45" rx="3" ry="5" fill="#FFD6E0" opacity="0.6" transform="rotate(-40, 195, 45)" />
        </svg>
      </div>

      <!-- Brand -->
      <div class="brand-section">
        <div class="brand-row">
          <svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" class="brand-logo">
            <defs>
              <linearGradient id="l1-logo-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#FFB7C5" />
                <stop offset="100%" stop-color="#F06292" />
              </linearGradient>
            </defs>
            <rect width="36" height="36" rx="9" fill="url(#l1-logo-grad)" />
            <!-- White cherry blossom on logo -->
            <g transform="translate(18,18)">
              <ellipse cx="0" cy="-7" rx="3" ry="6" fill="white" opacity="0.92" transform="rotate(0)" />
              <ellipse cx="0" cy="-7" rx="3" ry="6" fill="white" opacity="0.92" transform="rotate(72)" />
              <ellipse cx="0" cy="-7" rx="3" ry="6" fill="white" opacity="0.85" transform="rotate(144)" />
              <ellipse cx="0" cy="-7" rx="3" ry="6" fill="white" opacity="0.92" transform="rotate(216)" />
              <ellipse cx="0" cy="-7" rx="3" ry="6" fill="white" opacity="0.85" transform="rotate(288)" />
              <circle cx="0" cy="0" r="2.8" fill="white" opacity="0.95" />
            </g>
          </svg>
          <div class="brand-text">
            <span class="brand-name">Dashboard LightWeight</span>
            <span class="brand-sub">春日·欢迎归来</span>
          </div>
        </div>
      </div>

      <!-- Form -->
      <div class="form-section">
        <form @submit.prevent="handleLogin" autocomplete="off">
          <!-- Username field -->
          <div class="field">
            <label class="field-label">用户名</label>
            <div class="input-wrapper">
              <svg class="field-ico" viewBox="0 0 24 24" fill="none">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" />
              </svg>
              <input
                v-model="form.username"
                type="text"
                placeholder="请输入用户名"
                :disabled="isLoading"
                autocomplete="username"
                spellcheck="false"
              />
            </div>
          </div>

          <!-- Password field -->
          <div class="field" style="margin-top: 14px;">
            <label class="field-label">密码</label>
            <!-- Floating petals when focused -->
            <div class="petal-float-wrap">
              <transition name="petals-fade">
                <div v-if="passwordFocused" class="petal-floats" aria-hidden="true">
                  <span class="petal-char" style="--px: 15%; --pd: 0s; --pdx: -4px;">✿</span>
                  <span class="petal-char" style="--px: 48%; --pd: 0.35s; --pdx: 3px;">✿</span>
                  <span class="petal-char" style="--px: 78%; --pd: 0.18s; --pdx: -2px;">✿</span>
                </div>
              </transition>
            </div>
            <div
              class="input-wrapper"
              :class="{ 'input-focused': passwordFocused }"
            >
              <svg class="field-ico" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" stroke-width="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              </svg>
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="请输入密码"
                :disabled="isLoading"
                autocomplete="current-password"
                @focus="passwordFocused = true"
                @blur="passwordFocused = false"
              />
              <button type="button" class="eye-btn" @click="showPassword = !showPassword" tabindex="-1">
                <svg viewBox="0 0 24 24" fill="none">
                  <template v-if="!showPassword">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2" />
                    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" />
                  </template>
                  <template v-else>
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                    <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                  </template>
                </svg>
              </button>
            </div>
          </div>

          <!-- Error message -->
          <transition name="shake-in">
            <div v-if="errorMsg" class="error-msg">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="flex-shrink:0">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
                <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              </svg>
              {{ errorMsg }}
            </div>
          </transition>

          <!-- Submit button -->
          <button
            type="submit"
            class="submit-btn"
            :disabled="isLoading"
            style="margin-top: 18px;"
          >
            <span v-if="!isLoading" class="btn-content">
              登&nbsp;&nbsp;录
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <polyline points="9 18 15 12 9 6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
            <span v-else class="btn-content">
              <span class="btn-spinner"></span>验证中...
            </span>
          </button>
        </form>

        <!-- Footer links -->
        <div class="footer-links">
          <a href="/#/login" class="footer-link">返回默认登录</a>
        </div>
      </div>
    </div>

    <p class="copyright">© 2025 Dashboard LightWeight · All Rights Reserved</p>
  </div>
</template>

<style scoped>
/* ── Page ── */
.page {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  overflow: hidden;
  background: linear-gradient(160deg, #fff5f7 0%, #fde8ec 35%, #fef3f0 70%, #f0f8ea 100%);
}

/* ── Card ── */
.card {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 400px;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 183, 197, 0.45);
  border-radius: 22px;
  overflow: hidden;
  box-shadow:
    0 0 0 1px rgba(255, 143, 171, 0.15),
    0 8px 40px rgba(255, 107, 142, 0.14),
    0 24px 64px rgba(0, 0, 0, 0.08);
}

/* ── Deco strip ── */
.deco-strip {
  width: 100%;
  overflow: hidden;
  border-radius: 22px 22px 0 0;
  line-height: 0;
}

/* ── Brand section ── */
.brand-section {
  padding: 20px 28px 0;
}

.brand-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-logo {
  flex-shrink: 0;
  filter: drop-shadow(0 3px 10px rgba(255, 107, 142, 0.3));
}

.brand-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.brand-name {
  font-size: 20px;
  font-weight: 700;
  color: #5C1F3A;
  letter-spacing: -0.2px;
  line-height: 1.2;
}

.brand-sub {
  font-size: 12px;
  color: #B56080;
  letter-spacing: 0.5px;
}

/* ── Form section ── */
.form-section {
  padding: 16px 28px 0;
  padding-bottom: 28px;
}

/* ── Field ── */
.field {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.field-label {
  font-size: 12px;
  font-weight: 500;
  color: #9C5B73;
  letter-spacing: 0.3px;
}

/* ── Petal float effect ── */
.petal-float-wrap {
  position: relative;
  height: 0;
}

.petal-floats {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  pointer-events: none;
}

.petal-char {
  position: absolute;
  left: var(--px);
  bottom: 2px;
  font-size: 13px;
  color: #FF8FAB;
  opacity: 0;
  animation: petal-rise 2.4s ease-in-out infinite var(--pd);
  transform: translateX(var(--pdx, 0));
}

@keyframes petal-rise {
  0% {
    opacity: 0;
    transform: translateY(0) translateX(var(--pdx, 0)) scale(0.7);
  }
  20% {
    opacity: 0.9;
    transform: translateY(-10px) translateX(calc(var(--pdx, 0) * -0.5)) scale(1);
  }
  70% {
    opacity: 0.6;
    transform: translateY(-28px) translateX(calc(var(--pdx, 0) * 1.5)) scale(0.9);
  }
  100% {
    opacity: 0;
    transform: translateY(-42px) translateX(var(--pdx, 0)) scale(0.6);
  }
}

.petals-fade-enter-active,
.petals-fade-leave-active {
  transition: opacity 0.3s ease;
}

.petals-fade-enter-from,
.petals-fade-leave-to {
  opacity: 0;
}

/* ── Input wrapper ── */
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(255, 248, 250, 0.75);
  border: 1px solid rgba(255, 180, 194, 0.5);
  border-radius: 12px;
  transition:
    border-color 0.25s ease,
    box-shadow 0.25s ease;
}

.input-wrapper:focus-within,
.input-wrapper.input-focused {
  border-color: rgba(255, 107, 157, 0.7);
  box-shadow:
    0 0 0 3px rgba(255, 107, 157, 0.12),
    0 0 16px rgba(255, 183, 197, 0.35);
  animation: bloom-pulse 2.2s ease-in-out infinite;
}

@keyframes bloom-pulse {
  0%, 100% {
    box-shadow:
      0 0 0 3px rgba(255, 107, 157, 0.12),
      0 0 16px rgba(255, 183, 197, 0.35);
  }
  50% {
    box-shadow:
      0 0 0 3px rgba(255, 107, 157, 0.2),
      0 0 28px rgba(255, 183, 197, 0.55);
  }
}

.field-ico {
  width: 15px;
  height: 15px;
  color: rgba(180, 100, 130, 0.55);
  flex-shrink: 0;
  margin: 0 10px 0 14px;
}

.input-wrapper input {
  flex: 1;
  padding: 13px 12px 13px 0;
  font-size: 14px;
  color: #4A1942;
  background: transparent;
  border: none;
  outline: none;
  min-width: 0;
  caret-color: #FF8FAB;
}

.input-wrapper input::placeholder {
  color: rgba(180, 100, 130, 0.45);
}

/* ── Eye button ── */
.eye-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 42px;
  background: none;
  border: none;
  cursor: pointer;
  color: rgba(180, 100, 130, 0.5);
  flex-shrink: 0;
  transition: color 0.2s ease;
  padding: 0;
}

.eye-btn svg {
  width: 15px;
  height: 15px;
}

.eye-btn:hover {
  color: #FF8FAB;
}

/* ── Error message ── */
.error-msg {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 10px 14px;
  background: rgba(248, 113, 113, 0.08);
  border: 1px solid rgba(248, 113, 113, 0.25);
  border-radius: 8px;
  font-size: 13px;
  color: #f87171;
}

.shake-in-enter-active {
  animation: shake 0.42s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  18%       { transform: translateX(-7px); }
  36%       { transform: translateX(7px); }
  54%       { transform: translateX(-4px); }
  72%       { transform: translateX(4px); }
  90%       { transform: translateX(-2px); }
}

/* ── Submit button ── */
.submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 14px;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #FF8FAB 0%, #F06292 60%, #E91E8C 100%);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  letter-spacing: 0.5px;
  position: relative;
  overflow: hidden;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    opacity 0.2s ease;
}

.submit-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 55%);
  pointer-events: none;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 28px rgba(240, 98, 146, 0.5);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.62;
  cursor: not-allowed;
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  z-index: 1;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ── Footer links ── */
.footer-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 183, 197, 0.2);
}

.footer-link {
  font-size: 13px;
  color: rgba(180, 96, 128, 0.6);
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-link:hover {
  color: #F06292;
}

.footer-sep {
  font-size: 13px;
  color: rgba(255, 183, 197, 0.4);
}

/* ── Copyright ── */
.copyright {
  position: relative;
  z-index: 10;
  margin-top: 22px;
  font-size: 12px;
  color: rgba(180, 96, 128, 0.38);
  letter-spacing: 0.3px;
}

/* ── Responsive ── */
@media (max-width: 480px) {
  .card {
    margin: 0 14px;
  }

  .brand-section {
    padding: 18px 22px 0;
  }

  .form-section {
    padding: 14px 22px 24px;
  }
}
</style>
