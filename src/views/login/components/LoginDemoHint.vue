<template>
  <div class="demo-hint">
    <span class="demo-hint-label">演示账号</span>
    <span class="demo-hint-value">admin</span>
    <span class="demo-hint-sep">/</span>
    <span class="demo-hint-value">admin123</span>
  </div>
</template>

<style scoped>
.demo-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 12px;
  padding: 8px 14px;
  background: rgba(99, 102, 241, 0.08);
  border: 1px dashed rgba(99, 102, 241, 0.3);
  border-radius: 8px;
  font-size: 12px;
}

.demo-hint-label {
  color: rgba(148, 163, 184, 0.8);
  letter-spacing: 0.3px;
}

.demo-hint-value {
  font-family: monospace;
  font-size: 13px;
  font-weight: 600;
  color: #818cf8;
}

.demo-hint-sep {
  color: rgba(148, 163, 184, 0.5);
}
</style>
