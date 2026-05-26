<script setup lang="ts">
  import { useMenuStore } from '@/layouts/modules/global-menu/store';
  import LoginBrandBlock from './components/LoginBrandBlock.vue';
  import LoginDemoHint from './components/LoginDemoHint.vue';
  import LoginSecurityFooter from './components/LoginSecurityFooter.vue';
  import LoginThemeToggle from './components/LoginThemeToggle.vue';
  import { useLoginSubmit } from './composables/useLoginSubmit';
  import { useLoginThemeSync } from './composables/useLoginThemeSync';

  const menuStore = useMenuStore();
  const { isDark, toggleTheme } = useLoginThemeSync(menuStore);
  const { form, isLoading, errorMsg, handleLogin } = useLoginSubmit({
    async requestHandler(credentials) {
      // [MOCK MODE] 本地 Mock 登录验证，跳过后端请求
      // 演示账号：admin / admin123（任意非空账号密码均可登录）
      // 恢复后端连接时，注释掉下面的 mock 逻辑，取消注释下方原始请求代码
      await new Promise(resolve => setTimeout(resolve, 600));
      if (credentials.username !== 'admin' || credentials.password !== 'admin123') {
        throw new Error('演示账号：admin / admin123');
      }
      console.log('[Mock] 登录成功');

      // ── 原始后端请求（恢复时取消注释）──
      // const response = await bridgeClient.request.post<any>('/auth/login.json', credentials);
      // const data = response.data;
      // console.log('登录成功:', data);
      return null;
    },
  });
</script>

<template>
  <div
    data-testid="login-page"
    class="login-page"
    :class="isDark ? 'is-dark' : 'is-light'"
  >
    <!-- 动态背景光晕 -->
    <div class="bg-orb bg-orb-1"></div>
    <div class="bg-orb bg-orb-2"></div>
    <div class="bg-orb bg-orb-3"></div>

    <!-- 网格纹理叠加 -->
    <div class="bg-grid"></div>

    <!-- 主体卡片 -->
    <div class="glass-card">
      <!-- 主题切换按钮 -->
      <LoginThemeToggle
        :is-dark="isDark"
        @toggle="toggleTheme"
      />

      <!-- 品牌区域 -->
      <LoginBrandBlock />

      <!-- 分割线 -->
      <div class="divider">
        <span>安全登录</span>
      </div>

      <!-- 登录表单 -->
      <form
        @submit.prevent="handleLogin"
        class="login-form"
        autocomplete="off"
        data-testid="login-form"
      >
        <!-- 用户名 -->
        <div class="field-group">
          <div class="field-label">用户名</div>
          <div
            class="field-input-wrap"
            :class="{ disabled: isLoading }"
          >
            <span class="field-icon">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
                <circle
                  cx="12"
                  cy="7"
                  r="4"
                  stroke="currentColor"
                  stroke-width="2"
                />
              </svg>
            </span>
            <input
              id="username"
              v-model="form.username"
              data-testid="login-username"
              type="text"
              placeholder="请输入用户名"
              :disabled="isLoading"
              autocomplete="username"
            />
          </div>
        </div>

        <!-- 密码 -->
        <div class="field-group">
          <div class="field-label">密码</div>
          <div
            class="field-input-wrap"
            :class="{ disabled: isLoading }"
          >
            <span class="field-icon">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
              >
                <rect
                  x="3"
                  y="11"
                  width="18"
                  height="11"
                  rx="2"
                  stroke="currentColor"
                  stroke-width="2"
                />
                <path
                  d="M7 11V7a5 5 0 0 1 10 0v4"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </span>
            <input
              id="password"
              v-model="form.password"
              data-testid="login-password"
              type="password"
              placeholder="请输入密码"
              :disabled="isLoading"
              autocomplete="current-password"
            />
          </div>
        </div>

        <!-- 错误提示 -->
        <transition name="shake">
          <div
            v-if="errorMsg"
            class="error-alert"
            data-testid="login-error"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="2"
              />
              <line
                x1="12"
                y1="8"
                x2="12"
                y2="12"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
              <line
                x1="12"
                y1="16"
                x2="12.01"
                y2="16"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
            {{ errorMsg }}
          </div>
        </transition>

        <!-- 登录按钮 -->
        <button
          type="submit"
          class="login-btn"
          :disabled="isLoading"
          data-testid="login-submit"
        >
          <span
            v-if="!isLoading"
            class="btn-content"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
              <polyline
                points="10 17 15 12 10 7"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <line
                x1="15"
                y1="12"
                x2="3"
                y2="12"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
            登 录
          </span>
          <span
            v-else
            class="btn-spinner"
          >
            <span class="spinner-ring"></span>
            验证中...
          </span>
        </button>
      </form>

      <!-- 演示账号提示 -->
      <LoginDemoHint />

      <!-- 底部信息 -->
      <LoginSecurityFooter />
    </div>

    <!-- 页脚版权 -->
    <div class="page-footer">© 2025 Prism · 保留所有权利</div>
  </div>
</template>

<style scoped>
  /* ════════════════════════════════════════
     CSS 变量 — Dark 模式（默认）
  ════════════════════════════════════════ */
  .login-page.is-dark {
    --page-bg: #0a0f1e;
    --orb1-color: #1d4ed8, #3b82f6;
    --orb2-color: #1e40af, #6366f1;
    --orb3-color: #0ea5e9, #38bdf8;
    --orb-opacity: 0.45;
    --orb3-opacity: 0.2;
    --grid-color: rgba(59, 130, 246, 0.06);
    --card-bg: rgba(255, 255, 255, 0.05);
    --card-border: rgba(255, 255, 255, 0.12);
    --card-shadow:
      0 0 0 1px rgba(59, 130, 246, 0.25), 0 0 28px 6px rgba(59, 130, 246, 0.18),
      0 0 64px 16px rgba(99, 102, 241, 0.12), 0 16px 40px rgba(0, 0, 0, 0.45),
      0 0 0 1px rgba(255, 255, 255, 0.04) inset, 0 1px 0 rgba(255, 255, 255, 0.1) inset;
    --brand-name: #ffffff;
    --tagline: rgba(148, 163, 184, 0.9);
    --divider-line: rgba(255, 255, 255, 0.1);
    --divider-text: rgba(148, 163, 184, 0.7);
    --label: rgba(203, 213, 225, 0.9);
    --input-bg: rgba(255, 255, 255, 0.07);
    --input-border: rgba(255, 255, 255, 0.1);
    --input-focus-border: rgba(59, 130, 246, 0.7);
    --input-focus-bg: rgba(59, 130, 246, 0.06);
    --input-focus-shadow: rgba(59, 130, 246, 0.15);
    --input-text: #f1f5f9;
    --input-placeholder: rgba(148, 163, 184, 0.4);
    --icon-color: rgba(148, 163, 184, 0.7);
    --eye-color: rgba(148, 163, 184, 0.5);
    --eye-hover: rgba(148, 163, 184, 0.9);
    --footer-border: rgba(255, 255, 255, 0.08);
    --page-footer: rgba(100, 116, 139, 0.7);
    --toggle-bg: rgba(255, 255, 255, 0.08);
    --toggle-border: rgba(255, 255, 255, 0.12);
    --toggle-color: rgba(203, 213, 225, 0.8);
    --toggle-hover-bg: rgba(255, 255, 255, 0.14);
  }

  /* ════════════════════════════════════════
     CSS 变量 — Light 模式
  ════════════════════════════════════════ */
  .login-page.is-light {
    --page-bg: #eef2ff;
    --orb-opacity: 0.3;
    --orb3-opacity: 0.15;
    --grid-color: rgba(59, 130, 246, 0.05);
    --card-bg: rgba(255, 255, 255, 0.78);
    --card-border: rgba(255, 255, 255, 0.95);
    --card-shadow:
      0 0 0 1px rgba(59, 130, 246, 0.2), 0 0 24px 6px rgba(59, 130, 246, 0.14),
      0 0 56px 14px rgba(99, 102, 241, 0.08), 0 12px 32px rgba(37, 99, 235, 0.1),
      0 2px 8px rgba(0, 0, 0, 0.05), 0 1px 0 rgba(255, 255, 255, 0.9) inset;
    --brand-name: #1e293b;
    --tagline: #64748b;
    --divider-line: #e2e8f0;
    --divider-text: #94a3b8;
    --label: #374151;
    --input-bg: #f8fafc;
    --input-border: #e2e8f0;
    --input-focus-border: rgba(59, 130, 246, 0.6);
    --input-focus-bg: rgba(59, 130, 246, 0.04);
    --input-focus-shadow: rgba(59, 130, 246, 0.12);
    --input-text: #1e293b;
    --input-placeholder: #cbd5e1;
    --icon-color: #94a3b8;
    --eye-color: #94a3b8;
    --eye-hover: #64748b;
    --footer-border: #e2e8f0;
    --demo-color: #94a3b8;
    --page-footer: #94a3b8;
    --toggle-bg: rgba(37, 99, 235, 0.07);
    --toggle-border: rgba(37, 99, 235, 0.15);
    --toggle-color: #2563eb;
    --toggle-hover-bg: rgba(37, 99, 235, 0.13);
  }

  /* ── 页面容器 ── */
  .login-page {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: var(--page-bg);
    overflow: hidden;
    transition: background 0.4s ease;
  }

  /* ── 动态背景光晕 ── */
  .bg-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    pointer-events: none;
    transition: opacity 0.4s ease;
  }

  .bg-orb-1 {
    width: 520px;
    height: 520px;
    background: radial-gradient(circle, #1d4ed8, #3b82f6);
    opacity: var(--orb-opacity);
    top: -140px;
    left: -140px;
    animation: drift1 12s ease-in-out infinite alternate;
  }

  .bg-orb-2 {
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, #1e40af, #6366f1);
    opacity: var(--orb-opacity);
    bottom: -100px;
    right: -80px;
    animation: drift2 15s ease-in-out infinite alternate;
  }

  .bg-orb-3 {
    width: 280px;
    height: 280px;
    background: radial-gradient(circle, #0ea5e9, #38bdf8);
    opacity: var(--orb3-opacity);
    top: 50%;
    left: 55%;
    transform: translate(-50%, -50%);
    animation: drift3 18s ease-in-out infinite alternate;
  }

  @keyframes drift1 {
    from {
      transform: translate(0, 0) scale(1);
    }
    to {
      transform: translate(40px, 60px) scale(1.1);
    }
  }
  @keyframes drift2 {
    from {
      transform: translate(0, 0) scale(1);
    }
    to {
      transform: translate(-50px, -40px) scale(1.08);
    }
  }
  @keyframes drift3 {
    from {
      transform: translate(-50%, -50%) scale(1);
    }
    to {
      transform: translate(-46%, -54%) scale(1.15);
    }
  }

  /* ── 网格纹理 ── */
  .bg-grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(var(--grid-color) 1px, transparent 1px),
      linear-gradient(90deg, var(--grid-color) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
    transition: background-image 0.4s ease;
  }

  /* ── 玻璃卡片 ── */
  .glass-card {
    position: relative;
    z-index: 10;
    width: 100%;
    max-width: 420px;
    padding: 40px 40px 32px;
    background: var(--card-bg);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid var(--card-border);
    border-radius: 20px;
    box-shadow: var(--card-shadow);
    transition:
      background 0.4s ease,
      border-color 0.4s ease,
      box-shadow 0.4s ease;
  }

  /* ── 分割线 ── */
  .divider {
    display: flex;
    align-items: center;
    margin-bottom: 24px;
    gap: 12px;
  }

  .divider::before,
  .divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--divider-line);
    transition: background 0.35s ease;
  }

  .divider span {
    font-size: 12px;
    color: var(--divider-text);
    white-space: nowrap;
    letter-spacing: 0.5px;
    transition: color 0.35s ease;
  }

  /* ── 表单 ── */
  .login-form {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .field-group {
    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  .field-label {
    font-size: 13px;
    font-weight: 500;
    color: var(--label);
    letter-spacing: 0.2px;
    transition: color 0.35s ease;
  }

  .field-input-wrap {
    position: relative;
    display: flex;
    align-items: center;
    background: var(--input-bg);
    border: 1px solid var(--input-border);
    border-radius: 10px;
    transition:
      border-color 0.25s ease,
      background 0.25s ease,
      box-shadow 0.25s ease;
  }

  .field-input-wrap:focus-within {
    border-color: var(--input-focus-border);
    background: var(--input-focus-bg);
    box-shadow: 0 0 0 3px var(--input-focus-shadow);
  }

  .field-input-wrap.disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  .field-icon {
    display: flex;
    align-items: center;
    padding: 0 12px 0 14px;
    color: var(--icon-color);
    flex-shrink: 0;
    transition: color 0.35s ease;
  }

  .field-input-wrap input {
    flex: 1;
    padding: 13px 14px 13px 0;
    font-size: 14px;
    color: var(--input-text);
    background: transparent;
    border: none;
    outline: none;
    min-width: 0;
    transition: color 0.35s ease;
  }

  .field-input-wrap input::placeholder {
    color: var(--input-placeholder);
    transition: color 0.35s ease;
  }

  /* ── 错误提示 ── */
  .error-alert {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.25);
    border-radius: 8px;
    font-size: 13px;
    color: #f87171;
  }

  .shake-enter-active {
    animation: shake 0.4s ease;
  }

  @keyframes shake {
    0%,
    100% {
      transform: translateX(0);
    }
    20% {
      transform: translateX(-6px);
    }
    40% {
      transform: translateX(6px);
    }
    60% {
      transform: translateX(-4px);
    }
    80% {
      transform: translateX(4px);
    }
  }

  /* ── 登录按钮 ── */
  .login-btn {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 14px;
    margin-top: 4px;
    font-size: 15px;
    font-weight: 600;
    color: #fff;
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 10px;
    cursor: pointer;
    letter-spacing: 0.5px;
    overflow: hidden;
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease,
      opacity 0.2s ease;
  }

  .login-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, transparent 60%);
    pointer-events: none;
  }

  .login-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(37, 99, 235, 0.5);
  }

  .login-btn:active:not(:disabled) {
    transform: translateY(0);
  }

  .login-btn:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  .btn-content {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .btn-spinner {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .spinner-ring {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    flex-shrink: 0;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* ── 页脚 ── */
  .page-footer {
    position: relative;
    z-index: 10;
    margin-top: 28px;
    font-size: 12px;
    color: var(--page-footer);
    letter-spacing: 0.3px;
    transition: color 0.35s ease;
  }

  /* ── 响应式 ── */
  @media (max-width: 480px) {
    .glass-card {
      margin: 0 16px;
      padding: 32px 28px 28px;
    }
  }
</style>

