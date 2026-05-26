<template>
  <div class="card-footer">
    <div class="security-badge">
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
          stroke="currentColor"
          stroke-width="2"
          stroke-linejoin="round"
        />
      </svg>
      SSL 加密传输
    </div>
  </div>
</template>

<style scoped>
.card-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 24px;
  padding-top: 18px;
  border-top: 1px solid var(--footer-border);
  transition: border-color 0.35s ease;
}

.security-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: rgba(52, 211, 153, 0.8);
  letter-spacing: 0.2px;
}
</style>
