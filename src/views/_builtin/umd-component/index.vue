<script setup lang="ts">
  import { getCurrentInstance, computed } from 'vue';

  defineOptions({ name: 'UmdComponentPage' });

  const props = defineProps<{
    componentName: string;
  }>();

  // 检查组件名是否已在全局注册表中
  // 注意：appContext.components 非响应式，但 UMD 组件在路由注册前就已全部加载，
  // 所以本视图挂载时注册必然已完成，computed 首次求值结果即正确。
  const instance = getCurrentInstance();
  const isRegistered = computed(() => {
    if (!props.componentName || !instance) return false;
    return Object.prototype.hasOwnProperty.call(
      instance.appContext.components,
      props.componentName
    );
  });
</script>

<template>
  <div class="umd-component-page">
    <!-- 渲染已注册的 UMD 组件标签，用 wrapper 隔离布局样式，避免污染 UMD 组件的根元素 -->
    <div v-if="isRegistered" class="umd-component-content">
      <component :is="componentName" />
    </div>

    <!-- 组件未注册时的错误状态 -->
    <div
      v-else
      class="umd-not-found"
    >
      <i class="fas fa-puzzle-piece" />
      <p>组件 "{{ componentName }}" 未注册</p>
      <p class="umd-hint">请检查 UMD 文件是否已正确加载</p>
    </div>
  </div>
</template>

<style scoped>
  .umd-component-page {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
  }

  .umd-component-content {
    width: 100%;
    height: 100%;
    display: block;
  }

  .umd-not-found {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    color: #909399;
    font-size: 14px;
    gap: 10px;
  }

  .umd-not-found i {
    font-size: 36px;
    opacity: 0.5;
  }

  .umd-hint {
    font-size: 12px;
    opacity: 0.7;
  }
</style>
