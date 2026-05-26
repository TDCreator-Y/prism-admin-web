# IframePage 模块说明

本文档基于当前仓库的 IframePage 实现，说明入口组件、两种渲染分支、Teleport 管理与资源回收策略。

## 相关文件
- 入口组件：[index.vue](file:///e:/Dashboard/prism-admin-web/src/views/_builtin/iframe-page/index.vue)
- Webview 渲染器：[webview.vue](file:///e:/Dashboard/prism-admin-web/src/views/_builtin/iframe-page/webview.vue)
- Vue 动态组件渲染器：[vueComponent.vue](file:///e:/Dashboard/prism-admin-web/src/views/_builtin/iframe-page/vueComponent.vue)
- 页面状态管理：[teleport-manager.ts](file:///e:/Dashboard/prism-admin-web/src/store/modules/teleport-manager.ts)
- 布局容器：[base-layout/index.vue](file:///e:/Dashboard/prism-admin-web/src/layouts/base-layout/index.vue)

## 模块职责
- 统一承载动态菜单页面。
- 按路由参数决定渲染 `webview` 或 `vue` 页面。
- 为每个页面实例生成唯一 `pageId`，交给 TeleportManager 做显示切换与状态管理。
- 在页面关闭、切换和卸载时执行清理，避免残留 DOM、样式和缓存。

## 入口组件行为
- `index.vue` 接收 `url`、`routeId`、`functionId`、`type`、`routeQuery`、`backendOrigin` 等 props。
- 组件挂载时先执行 `fetchFunctionAccess()`，再确定最终渲染地址和渲染类型。
- 当前开发态默认返回本地 Mock 页面 `/mock-demo.html`，因此无需依赖真实后端也能演示链路。
- 注释里保留的历史权限请求只用于说明接回后端时的接入点，不代表当前需要修改的运行时接口。

## 渲染分支
- `renderType === 'webview'` 时，使用 [webview.vue](file:///e:/Dashboard/prism-admin-web/src/views/_builtin/iframe-page/webview.vue) 渲染 iframe 页面。
- `renderType === 'vue'` 时，使用 [vueComponent.vue](file:///e:/Dashboard/prism-admin-web/src/views/_builtin/iframe-page/vueComponent.vue) 动态加载并渲染 Vue 组件。
- 如果 `props.type` 未显式指定，但 URL 或 `functionId` 以 `.vue` 结尾，入口组件会自动识别为 `vue`。

## Teleport 与页面切换
- 页面实例 ID 由 [teleport-manager.ts](file:///e:/Dashboard/prism-admin-web/src/store/modules/teleport-manager.ts) 的 `generatePageId()` 生成。
- `registerPage()`、`requestActivation()`、`forceActivate()` 负责注册页面、请求激活和切换显示。
- `shouldShowPage()` 根据 `pending`、`loading`、`ready`、`active`、`hidden` 状态控制页面是否可见。
- 多标签页切换时，IframePage 只保留当前活动实例为可见状态，其他实例转为隐藏。

## 自定义路由参数
- 当路由路径以 `/custom_` 或 `/bridge_` 开头，且最终渲染类型为 `vue` 时，入口组件会把 `routeQuery` 写入 `window.customRouteParamsManager`。
- 参数键使用 `route.fullPath`，便于远程组件按路由维度读取当前上下文。
- 组件清理时会同步移除这部分临时参数，避免跨标签串值。

## 资源回收
- 入口组件通过 `useEventBus('tab-close')` 监听标签关闭事件。
- 页面关闭或组件卸载时会执行 `cleanupAll()`，注销 Teleport 页面实例并清理回调。
- TeleportManager 还提供 `removeComponentCacheByPath()`，用于在关闭标签时清除 Vue 远程组件缓存。

## 排查建议
- 页面一直显示加载中时，先检查 `fetchFunctionAccess()` 是否正确结束并更新 `isLoading`。
- 页面内容为空时，优先检查传入的 `url`、`routeId`、`type` 是否与动态路由生成结果一致。
- 关闭标签后仍有残留组件时，优先检查 `tab-close` 事件是否触发，以及 `removeComponentCacheByPath()` 是否命中正确缓存键。
