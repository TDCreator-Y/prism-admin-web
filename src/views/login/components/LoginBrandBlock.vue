<template>
  <div class="brand-area">
    <div class="brand-logo">
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          width="40"
          height="40"
          rx="10"
          fill="url(#logoGrad)"
        />
        <path
          d="M12 20L18 26L28 14"
          stroke="white"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <defs>
          <linearGradient
            id="logoGrad"
            x1="0"
            y1="0"
            x2="40"
            y2="40"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#3B82F6" />
            <stop
              offset="1"
              stop-color="#1D4ED8"
            />
          </linearGradient>
        </defs>
      </svg>
    </div>
    <div class="brand-text">
      <h1 class="brand-name">Prism</h1>
      <p class="brand-tagline">企业级后台管理系统</p>
    </div>
  </div>
</template>

<style scoped>
.brand-area {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 28px;
}

.brand-logo svg {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  filter: drop-shadow(0 4px 12px rgba(59, 130, 246, 0.5));
}

.brand-name {
  margin: 0 0 2px;
  font-size: 22px;
  font-weight: 700;
  color: var(--brand-name);
  letter-spacing: -0.3px;
  transition: color 0.35s ease;
}

.brand-tagline {
  margin: 0;
  font-size: 12px;
  color: var(--tagline);
  letter-spacing: 0.3px;
  transition: color 0.35s ease;
}
</style>
