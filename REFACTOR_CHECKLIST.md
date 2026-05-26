# 项目优化与重构清单

> 基于代码全面分析生成，按优先级排列。✅ = 已完成。

---

## 一、逻辑重复与冗余消除

- ✅ **1. `menu-domain.ts`：用 `findMenuParents` 替换 `findAllParents`**
  - 私有函数 `findAllParents` 与 `types.ts` 导出的 `findMenuParents` 功能完全重复
  - `findAllParents` 中 `if (found.length >= 0)` 永远为真，存在冗余条件
  - 替换后删除 `findAllParents`，减少重复逻辑

- ✅ **2. `menu-domain.ts`：`breadcrumbs` 计算改用 `findMenuParents` + `findMenuByPath`**
  - 原 while 循环改为直接使用已有的 `findMenuParents(menuList, path)`
  - 同时修复预存 bug：原代码用 `findMenuByKey` 按 key 查找但传入的是 path；改用新增的 `findMenuByPath` 正确按路径查找
  - 将 `findMenuByKey`、`findMenuByPath` 提升到 `types.ts` 作为共享工具，并删除 `menu-domain.ts` 中的私有版本

- ✅ **3. `global-menu/types.ts`：删除 `transformRouteToMenu` 中冗余的二次 `hidden` 检查**
  - 第 75 行 `continue` 已过滤 `hidden === true`，第 110 行再次检查 `!route.meta?.hidden` 冗余
  - 删除第 110 行的 `if (!route.meta?.hidden)` 包裹，直接 push

---

## 二、TypeScript 类型安全

- ✅ **4. `eslint.config.mjs`：`@typescript-eslint/no-explicit-any` 由 `off` 改为 `warn`**
  - 当前完全关闭对 `any` 类型的检查，会导致类型不安全使用无感知
  - 改为 `warn` 可在保留灵活性的同时发现潜在问题

- ✅ **5. `guards.ts`：`afterEach` 未使用的 `to`/`from` 参数改为 `_to`/`_from`**
  - ESLint 规则已配置 `argsIgnorePattern: '^_'`
  - 同时修复 `catch (e)` 改为 `catch`（e 未使用）

- ✅ **6. `global-menu/types.ts`：`MenuItem.meta` 类型从 `Record<string, unknown>` 改为 `RouteMeta`**
  - 引入 `import type { RouteMeta } from 'vue-router'`，提升与 Vue Router 的类型一致性
  - 同时去除 `transformRouteToMenu` 中不必要的 `as Record<string, unknown>` 类型转换

---

## 三、Vite 配置整理

- ✅ **7. `vite.config.ts`：删除废弃注释的插件引用**
  - 删除 `vueDevTools`、`vueAutoRouter` 的注释 import 和 plugins 中对应注释行

- ✅ **8. `vite.config.ts`：提取 `serveVendoredVueSfcLoaderRuntime` 插件的行内类型声明**
  - 提取为具名接口 `ViteMiddlewareRes`、`ViteDevServerLike`，置于函数外部
  - 同时简化 `generateBundle` 的 this 类型为单行

---

## 四、路由模块整理

- ✅ **9. `router/index.ts`：模块级全局变量整合为 `routerState` 对象**
  - 5 个分散的全局变量（`dynamicRoutesLoaded`、`routesLoadPromise`、`originalAuthRoutes`、`targetNavigation`、`dynamicRouteNames`）整合为 `routerState` 对象
  - 提升可读性，便于调试和后续单元测试

---

## 五、注释代码整理

- ✅ **10. `remote-component-config.ts`：精简注释块，保留指引说明**
  - 大段注释的后端请求代码（~30 行）替换为单行恢复指引

- ✅ **11. `menu-service.ts`：同上，精简注释的后端请求代码块**
  - 整理为简洁注释，清除多余注释代码

---

## 六、单元测试补充

- ✅ **12. `menu-domain.spec.ts`：补充 `setSelectedKey` 和面包屑计算测试**
  - 新增：深层路径下 `openKeys` 只展开直接父节点
  - 新增：根级路径不展开任何 key
  - 新增：面包屑按 top-to-leaf 顺序正确排列（同时验证上方的 bug 修复）
  - 新增：未找到路径时面包屑返回空数组

- ✅ **13. `tabs-domain.spec.ts`：补充 `removeLeftTabs`/`removeRightTabs` preserveHome 测试**
  - 新增：`removeRightTabs` 中保留首页标签逻辑
  - 新增：`preserveHomeTab: false` 时首页可被正常删除

---

## 七、视图层架构审查（Phase 2）

### 响应式陷阱修复

- ✅ **14. `base-layout/index.vue`：删除与 guards.ts 重复的 `watch(() => route.path, ...)`**
  - `guards.ts` 的 `beforeEach` 已执行 `setSelectedKey` + `addTab`，此处 watch 造成每次导航双重触发
  - 同时移除已无用的 `watch`、`useRoute`、`MenuItem` 导入及 `const route` 声明

- ✅ **15. `global-header/index.vue`：删除两处死代码**
  - `const menuList = ref(menuStore.menuList)` — 非响应式快照，从未在模板中引用
  - `function toggleUserDropdown()` — 从未被调用

- ✅ **16. `iframe-page/index.vue`：移除 watch 上多余的 `{ deep: true }` 及未使用导入**
  - 监听 `[props.url, props.routeId, props.type]` 数组元素均为原始值，`deep: true` 无效且有误导性
  - 移除未使用的 `getGlobalConfig` 导入（仅出现在已注释代码中）
  - 移除未使用的 `determineRenderTypeByHandler` 函数（同上）

### 上帝组件拆分

- ✅ **17. `ThemeToggleRow.vue`：提取主题抽屉中重复 6 次的开关行**
  - 新增 `src/layouts/modules/theme-drawer/ThemeToggleRow.vue`（Dumb 组件）
  - Props: `label: string`、`modelValue: boolean`；Emit: `update:modelValue`
  - `theme-drawer/index.vue` 从 ~250 行缩减至 ~170 行

- ✅ **18. `HeaderActionBar.vue`：提取两个 header 块中完全相同的右侧工具栏**
  - 新增 `src/layouts/modules/global-header/HeaderActionBar.vue`（Smart 组件）
  - 内聚：全屏切换、刷新标签页、暗色模式、用户下拉、主题设置、退出登录
  - `global-header/index.vue` 从 393 行缩减至 ~125 行，两处工具栏重复彻底消除

### 海量数据渲染

- ✅ **19. `server-info/index.vue`：日志表格增加客户端分页**
  - 新增 `currentPage`、`totalPages`（PAGE_SIZE=10）、`paginatedLogs` computed
  - 分页控制栏：上一页/页码按钮/下一页，`totalPages <= 1` 时自动隐藏

---

---

## 八、API 层安全与健壮性审查（Phase 3）

### Token 与鉴权

- ✅ **20. `utils/http.ts`：新建统一 fetch 包装器，统一注入 `credentials: 'include'`**
  - 所有方法（get / post / put / delete）自动携带 Cookie/Session 凭据
  - 将 HTTP 错误分类为具名属性：`isUnauthorized`、`isForbidden`、`isServerError`、`isNetworkError`
  - 网络层错误（断网/CORS）包装为 `HttpError(0, message)` 而非裸 TypeError
  - 内置 Refresh Token 锁注释模板，接入真实 JWT 时可直接启用

- ✅ **21. `HeaderActionBar.vue`：logout 改用 `http.post`，401 不阻塞登出流程**
  - 原 `fetch` 无 `credentials`，跨域场景 Session 无法正确销毁
  - `401`（session 已过期）静默处理；其他错误 toast 警告但不阻塞清理跳转

### 全局异常收口

- ✅ **22. `composables/useToast.ts`：新建模块级单例 Toast composable**
  - 支持 `success / error / warn / info` 四种类型，可自定义持续时长
  - 模块级 `ref` — 所有组件共享同一个队列，无需 provide/inject

- ✅ **23. `components/global/GlobalToast.vue`：Toast UI 组件，挂载到 App.vue**
  - Teleport 到 `body` + TransitionGroup 入场/离场动画
  - 深色模式自适应，z-index 9999 保证最顶层显示

- ✅ **24. `views/dashboard/index.vue`：用 Toast 替换 `alert()`**
  - 上传成功 → `toast.success()`；失败 → `toast.error()` + `console.error`
  - 同时接入 `useCancellableRequest`，防止重复点击发出多个并发上传

### 竞态条件

- ✅ **25. `composables/useCancellableRequest.ts`：新建 AbortController 生命周期绑定 composable**
  - `newSignal()` 自动取消前一个未完成请求
  - `onUnmounted` 自动 abort，防止已卸载组件的陈旧状态写入

- ✅ **26. `iframe-page/index.vue`：watch 与 onMounted 接入 AbortController**
  - 修复 Phase 2 遗留语法错误（移除 `{ deep: true }` 时误删了回调结束 `}`）
  - `fetchFunctionAccess` 接受 `signal?: AbortSignal` 参数（真实后端恢复时透传给 `http.get`）
  - props 快速变化时旧请求被取消，`signal.aborted` 守卫防止陈旧数据写入状态
  - `onUnmounted` 显式 `cancelFetch()` 兜底

---

---

## 九、Vite 构建与 FCP 性能优化（Phase 4）

### 移除阻塞首屏的无效资源

- ✅ **27. `index.html`：移除未使用的 ECharts CDN parser-blocking script**
  - `src/` 全目录 grep 确认：无任何 `echarts` / `window.echarts` 引用，ECharts 从未在源码中使用
  - 原 `<script src="echarts@6.0.0">` 在 `<head>` 中无 `async`/`defer`，属于 parser-blocking 请求（~900 KB）
  - 删除该 script 标签，同步移除 `cdn.jsdelivr.net` 的 `dns-prefetch` 和 `preconnect` 提示

### Font Awesome 按需子集化

- ✅ **28. `index.html`：Font Awesome 从 `all.min.css` 切换为 `solid` 子集**
  - 全项目 grep 确认：所有图标均使用 `fas` 前缀，无 `fab`（brands）/ `far`（regular）用法
  - `all.min.css` 包含 solid、regular、brands、light、duotone 等全部字体家族
  - 替换为 `fontawesome.min.css`（基础类）+ `solid.min.css`（fas 图标定义），大幅缩减渲染阻塞 CSS 体积
  - cdnjs 单一来源，保留 `preconnect` 提示

### 当前 vite.config.ts 评估（无需更改）

- `manualChunks` 已正确拆分：`vendor-vue`（vue+router+pinia）/ `vendor-vueuse` / `iframe-vue-component`
- `esbuild.drop: ['console', 'debugger']` 生产模式已启用
- `vue3-sfc-loader.esm.js`（1.75 MB）通过动态 `import()` 懒加载，不阻塞 FCP
- Vite 自动生成 `<link rel="modulepreload">` 覆盖关键 vendor chunk

---

*全部 28 项已完成 · 测试 34 个全部通过 · 完成日期：2026-05-26*
