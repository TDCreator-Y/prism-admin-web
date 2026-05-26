# Vue 动态组件与 Teleport 投射页面实现详解

本文档详细分析了 `src/views/_builtin/iframe-page/[url].vue` 及其相关组件的实现机制。该架构采用了 **"路由负责状态，Teleport 负责渲染"** 的模式，通过全局管理器（Store）来控制多组件实例的共存与切换，完美解决了 iframe 和 Vue 组件在复杂 Tab 切换场景下的状态保持问题。

## 1. 核心架构概述

传统的 Vue 路由切换通常会销毁旧组件并创建新组件（除非使用 `KeepAlive`）。但在混合应用（Vue + Iframe）中，简单的 `KeepAlive` 往往不够用，特别是对于 Iframe（DOM 重建会导致刷新）。

本方案采用了以下架构：
*   **路由层 (`Router`)**：仅用于 URL 变化和组件的初始化（Mount），但不直接渲染可见内容（父容器被隐藏）。
*   **渲染层 (`Teleport`)**：所有实际内容通过 Vue 的 `<Teleport>` 组件投射到应用根部的 `#teleport-root` 容器中。
*   **管理层 (`TeleportManager`)**：一个 Pinia Store，负责记录所有活跃页面的 ID、状态，并控制谁该显示（`v-show`）。

---

## 2. 核心文件分析

### 2.1 入口分发器：`iframe-page/[url].vue`

这是路由对应的视图组件，它充当**分发器**（Dispatcher）。

*   **职责**：
    1.  接收路由参数 (`url`, `routeId`, `type`)。
    2.  生成当前页面实例的 **唯一 ID** (`currentPageId`)。
    3.  根据 `type` 决定渲染哪个子组件：
        *   `WebviewComponent` (Iframe)
        *   `VueComponent` (动态 Vue)
    4.  处理 Tab 关闭事件以清理资源。

*   **关键代码**：
    ```typescript
    // 生成唯一ID，确保即使是同一个URL，在不同Tab打开也是不同实例
    const currentPageId = ref('');
    // ...
    currentPageId.value = teleportManager.generatePageId(url, routeId, type);
    ```

### 2.2 全局管理器：`store/modules/teleport-manager.ts`

这是整个系统的**大脑**。

*   **状态设计**：
    *   `pageRegistry`: Map<string, PageInstance>。存储所有已注册页面的信息。
    *   `activePageId`: string。当前处于激活状态（显示中）的页面 ID。
*   **核心逻辑**：
    *   `shouldShowPage(id)`: 判断某个 ID 是否应该显示（只有当 `id === activePageId` 时返回 true）。
    *   `registerPage`: 组件挂载时调用，注册自己。
    *   `requestActivation`: 组件激活时（`onActivated`）调用，抢占 `activePageId`。

### 2.3 渲染器组件（以 `vueComponent.vue` 为例）

这是实际承载内容的组件。

*   **Teleport 投射**：
    ```html
    <template>
      <!-- 将内容投射到 body 下的 #teleport-root 节点 -->
      <Teleport to="#teleport-root">
        <!-- 控制显示/隐藏，而不是销毁 -->
        <div v-if="isRendered" v-show="isActive" :id="containerId" class="containers">
           <!-- 内容区域 -->
        </div>
      </Teleport>
    </template>
    ```

*   **动态加载 (`vue3-sfc-loader`)**：
    父组件通过 `loadModule` 加载远程 `.vue` 文件，传给子组件，子组件使用 `<component :is="asyncComponent">` 渲染。

*   **状态控制**：
    *   `watchEffect` 监听 `teleportManager.shouldShowPage(instanceId)`。
    *   如果为 `true` -> `isActive.value = true` (`v-show` 显示)。
    *   如果为 `false` -> `isActive.value = false` (`v-show` 隐藏)。
    *   **延迟渲染机制**：为了防止切换时的闪烁，使用了 `delayedRender` (300ms 延时)。

---

## 3. 功能实现指南 (复刻步骤)

要在另一个项目中一模一样地实现此功能，请按以下步骤操作：

### 步骤 1: 准备宿主环境

在你的主布局文件（如 `App.vue` 或 `BaseLayout.vue`）中，添加一个用于接收 Teleport 的容器。这个容器应该在所有常规路由视图之外。

```html
<!-- App.vue 或 Layout.vue -->
<template>
  <div class="app-container">
    <!-- 常规路由视图（如果完全采用此模式，这里可以隐藏） -->
    <RouterView />

    <!-- Teleport 目标容器 -->
    <div id="teleport-root" style="width: 100%; height: 100%; position: absolute; top: 0; left: 0; z-index: 10;"></div>
  </div>
</template>
```

### 步骤 2: 实现 Teleport 管理器 (Pinia Store)

创建 `src/store/teleport-manager.ts`，实现页面注册和激活逻辑。

**核心要点**：
1.  维护一个 `activePageId`。
2.  提供 `registerPage(id)` 和 `unregisterPage(id)`。
3.  提供 `shouldShowPage(id)` 返回 `activePageId === id`。

### 步骤 3: 实现通用渲染组件 (`VueComponent.vue`)

创建一个通用的包装组件，用于包裹动态内容并处理 Teleport 逻辑。

```vue
<script setup lang="ts">
import { ref, watchEffect, onMounted, onActivated, onBeforeUnmount } from 'vue';
import { useTeleportManager } from '@/store/teleport-manager';

const props = defineProps<{ pageId: string }>();
const manager = useTeleportManager();
const isActive = ref(false);

// 1. 监听全局状态决定显示/隐藏
watchEffect(() => {
  isActive.value = manager.shouldShowPage(props.pageId);
});

// 2. 挂载时注册
onMounted(() => {
  manager.registerPage(props.pageId);
});

// 3. 激活时请求显示权
onActivated(() => {
  manager.requestActivation(props.pageId);
});

// 4. 卸载时注销
onBeforeUnmount(() => {
  manager.unregisterPage(props.pageId);
});
</script>

<template>
  <Teleport to="#teleport-root">
    <div v-show="isActive" class="full-size-page">
      <slot></slot> <!-- 插槽放入实际内容 -->
    </div>
  </Teleport>
</template>

<style scoped>
.full-size-page {
  width: 100%;
  height: 100%;
}
</style>
```

### 步骤 4: 实现入口页面 (`[url].vue`)

这是路由指向的组件。

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import VueComponent from './VueComponent.vue';

const route = useRoute();
// 生成唯一ID：基于 URL + 时间戳 + 随机数，确保唯一性
const pageId = `page-${route.path}-${Date.now()}`;

// 加载逻辑（如 loadModule）在这里处理，然后传给子组件
</script>

<template>
  <!-- 这里的 div 在 DOM 中实际上是空的或者被隐藏的，因为内容被 Teleport 走了 -->
  <div class="placeholder">
    <VueComponent :page-id="pageId">
       <!-- 动态组件内容 -->
    </VueComponent>
  </div>
</template>
```

### 步骤 5: 路由配置

配置动态路由以匹配入口页面。

```typescript
{
  path: '/iframe-page/:url',
  component: () => import('@/views/iframe-page/[url].vue'),
  props: true,
  meta: {
    keepAlive: true // 必须开启 KeepAlive，否则切换路由时组件会被销毁
  }
}
```

## 4. 关键技术点总结

| 功能点 | 实现方式 |
| :--- | :--- |
| **多组件渲染** | 父组件 (`[url].vue`) 根据类型 (`v-if/v-else-if`) 渲染不同的子组件包装器。 |
| **组件状态保持** | 路由层开启 `KeepAlive` 保持组件实例不被销毁；渲染层使用 `v-show` 保持 DOM 元素不被移除。 |
| **唯一 ID** | `url` + `routeId` + `timestamp` 组合生成，确保多 Tab 打开同一 URL 时互不干扰。 |
| **显示控制** | **Pinia Store (单一数据源)** 决定哪个 ID 是 Active 的，组件内部 `watch` 该状态来切换 `v-show`。 |
| **Teleport** | `<Teleport to="#teleport-root">` 将 DOM 结构物理移动到顶层容器，规避了父级 `display: none` 或 `z-index` 的限制。 |

这种模式非常适合构建类似操作系统窗口管理器的 Web 应用，或者需要深度集成第三方非 Vue 视图（如 GIS 地图、报表工具、旧版系统）的场景。

