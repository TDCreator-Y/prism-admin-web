# 动态路由模块说明

本文档基于当前仓库实现，说明动态路由从菜单数据到 Vue Router 路由记录的生成流程，以及缓存与 IframePage 的协作方式。

## 模块入口
- 对外导出入口：[index.ts](file:///e:/Dashboard/Dashboard-lightWeight/src/router/routes/index.ts)
- 生成主流程：[dynamic-routes.ts](file:///e:/Dashboard/Dashboard-lightWeight/src/router/routes/dynamic-routes.ts)
- 菜单树处理：[menu-tree.ts](file:///e:/Dashboard/Dashboard-lightWeight/src/router/routes/menu-tree.ts)
- 路由转换：[route-transform.ts](file:///e:/Dashboard/Dashboard-lightWeight/src/router/routes/route-transform.ts)
- 缓存逻辑：[cache.ts](file:///e:/Dashboard/Dashboard-lightWeight/src/router/routes/cache.ts)

## 生成流程
1. `generateDynamicRoutes()` 先等待远程 UMD 组件注册完成，再尝试从本地缓存恢复动态路由。
2. 缓存不可用时，通过 [menu-tree.ts](file:///e:/Dashboard/Dashboard-lightWeight/src/router/routes/menu-tree.ts) 的 `getRootMenu()` 调用菜单服务获取根菜单数据。
3. 扁平菜单数据经过 `getMenuTree()` 重组为树形结构。
4. 树形菜单传入 [route-transform.ts](file:///e:/Dashboard/Dashboard-lightWeight/src/router/routes/route-transform.ts) 的 `generateRoutes()`，生成中间态 `ElegantRoute`。
5. `transformRoutesToVueRoutes()` 将 `ElegantRoute` 转换为 Vue Router 可用的 `RouteRecordRaw`。
6. 最终与自动路由、静态路由、UMD 路由合并，返回 `{ constantRoutes, authRoutes }`。

## 菜单数据来源
- 当前运行时菜单入口是 [menu-service.ts](file:///e:/Dashboard/Dashboard-lightWeight/src/router/routes/menu-service.ts) 的 `fetchMenuData()`。
- 开发阶段默认返回本地 Mock 数据，便于在没有后端依赖时启动项目。
- 注释中保留了历史接口示例，仅用于说明恢复真实后端时的接入位置，不代表当前正式接口契约。

## 路由映射规则
- 根节点使用 `layout.base` 作为布局容器。
- 有子节点的菜单项使用 `layout.passthrough` 继续承载子路由。
- 叶子节点统一映射为 `view.iframe-page`，由 IframePage 决定使用 `webview` 还是 `vue` 渲染。
- 当菜单节点既有子节点又有功能入口时，会自动补一个默认子页面 `path: ''`，避免功能入口丢失。
- 菜单标题优先读取 `DisplayName`，为空时回退到 `Title`。

## 缓存策略
- 缓存键定义在 [cache.ts](file:///e:/Dashboard/Dashboard-lightWeight/src/router/routes/cache.ts) 的 `DYNAMIC_ROUTES_CACHE`。
- 缓存内容包含路由数据、时间戳、`UserCode`、`InternalCode` 与版本号。
- 恢复缓存时会校验版本、24 小时有效期、用户标识和系统标识，不满足条件则直接丢弃。
- 缓存中保存的是 `ElegantRoute`，恢复时再转换为 Vue Router 路由，避免生产构建后组件映射失真。

## 全局配置依赖
- 运行时配置由 [global-config.ts](file:///e:/Dashboard/Dashboard-lightWeight/src/router/routes/global-config.ts) 统一管理。
- 动态路由依赖 `InternalCode`、`UserCode`、`Origin`、`DisplayName` 等配置项。
- 默认配置从 `window.uiGlobalConfig` 读取，缺省时使用项目内置兜底值。

## 与 IframePage 的关系
- 页面型动态路由最终都落到 [index.vue](file:///e:/Dashboard/Dashboard-lightWeight/src/views/_builtin/iframe-page/index.vue)。
- 路由 props 中会携带 `url`、`routeId`、`functionId`、`type` 等字段。
- IframePage 再根据 `type` 和动态权限结果选择渲染 Webview 或 Vue 远程组件。
- 多实例显示与切换由 [teleport-manager.ts](file:///e:/Dashboard/Dashboard-lightWeight/src/store/modules/teleport-manager.ts) 负责管理。

## 调试建议
- 菜单数据异常时，先检查 [menu-service.ts](file:///e:/Dashboard/Dashboard-lightWeight/src/router/routes/menu-service.ts) 返回值结构是否满足 `MenusMain.Results`。
- 路由恢复异常时，优先清理 `DYNAMIC_ROUTES_CACHE` 后重试。
- 页面命中但内容空白时，重点检查 `route-transform.ts` 传入的 `type`、`url` 与 IframePage 的渲染分支是否一致。
