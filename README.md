# Prism Admin Web

[中文](#中文) | [English](#english)

---

<a id="中文"></a>

# 棱镜后台管理系统

基于 Vue 3 + Vite + TypeScript 构建的现代后台管理框架，支持动态路由、远程 UMD 组件加载、多布局与暗黑模式。

## 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 前端框架 | Vue 3 | 3.5.x |
| 构建工具 | Vite | 7.x |
| 类型系统 | TypeScript | 5.8.x |
| 状态管理 | Pinia | 2.x |
| 路由管理 | Vue Router | 4.x |
| 样式框架 | Tailwind CSS | 3.x |
| 组合式工具 | VueUse | 14.x |
| 包管理器 | pnpm | 8.x |

## 核心特性

- **动态路由**：后端驱动的菜单 → 路由自动转换，支持路由守卫与权限控制
- **远程组件**：运行时动态加载 UMD 格式组件，无需重新构建
- **多布局**：侧边栏 / 顶部导航 / 混合模式，暗黑模式一键切换
- **标签页管理**：多标签操作、右键菜单、持久化存储
- **宿主桥接**：预留 `window.appBridge` 接口，支持与外层宿主应用通信
- **完整工程链**：类型检查、单元测试、E2E 测试、覆盖率统计、代码规范

## 环境要求

- Node.js `^20.19.0` 或 `>=22.12.0`
- pnpm `>=8.15.0 <9`

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产包
pnpm build

# 预览构建结果
pnpm preview
```

## 常用脚本

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器（Hot Reload） |
| `pnpm build` | 类型检查 + 构建生产包 |
| `pnpm preview` | 预览构建产物（端口 4173） |
| `pnpm lint` | ESLint 代码检查 |
| `pnpm lint:fix` | ESLint 自动修复 |
| `pnpm type-check` | vue-tsc 类型检查 |
| `pnpm test` | 单元测试（Vitest，Watch 模式） |
| `pnpm test:ci` | 单元测试 + 覆盖率报告 |
| `pnpm e2e` | E2E 测试（构建后执行） |
| `pnpm e2e:headed` | E2E 有界面模式 |

## 测试

### 单元测试

使用 **Vitest** + **jsdom**，测试文件位于 `tests/` 目录。

```bash
pnpm test          # Watch 模式
pnpm coverage      # 生成覆盖率报告（输出至 coverage/）
```

覆盖范围包括路由守卫、菜单/标签页业务逻辑、远程组件加载器、宿主桥接层等核心模块。

### E2E 测试

使用 **Playwright**，测试文件位于 `e2e/` 目录，覆盖认证流程、菜单导航、标签页操作和 Iframe 页面。

```bash
pnpm e2e           # 无界面运行
pnpm e2e:headed    # 有界面运行（Chromium）
pnpm e2e:report    # 查看测试报告
```

## 项目结构

```
src/
├── bridge/          # 宿主环境通信桥接层
├── components/      # 全局公共组件
├── composables/     # 组合式函数（Hooks）
├── config/          # 运行时配置
├── layouts/         # 布局框架（含菜单、标签页、主题抽屉等）
├── router/          # 路由配置与守卫
├── store/           # Pinia 状态管理
├── styles/          # 全局样式
├── utils/           # 工具函数（远程组件加载、HTTP 请求等）
├── vendors/         # 本地化第三方依赖
└── views/           # 页面视图
    └── _builtin/    # 内置特殊页面（UMD 组件容器、Iframe 容器）
```

## 许可证

[MIT License](./LICENSE) © 郁子恒

---

<a id="english"></a>

# Prism Admin Web

A modern admin framework built with Vue 3 + Vite + TypeScript, featuring dynamic routing, remote UMD component loading, multiple layouts, and dark mode support.

## Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| Framework | Vue 3 | 3.5.x |
| Build Tool | Vite | 7.x |
| Type System | TypeScript | 5.8.x |
| State Management | Pinia | 2.x |
| Routing | Vue Router | 4.x |
| Styling | Tailwind CSS | 3.x |
| Composition Utils | VueUse | 14.x |
| Package Manager | pnpm | 8.x |

## Key Features

- **Dynamic Routing** — Backend-driven menu-to-route transformation with route guards and permission control
- **Remote Components** — Runtime loading of UMD-format components without rebuilding
- **Multiple Layouts** — Sidebar / top-nav / mixed mode with one-click dark mode toggle
- **Tab Management** — Multi-tab operations, context menus, and persistent storage
- **Host Bridge** — Reserved `window.appBridge` interface for communication with the host application
- **Full Engineering Pipeline** — Type checking, unit tests, E2E tests, coverage reports, and linting

## Requirements

- Node.js `^20.19.0` or `>=22.12.0`
- pnpm `>=8.15.0 <9`

## Getting Started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server with Hot Reload |
| `pnpm build` | Type-check and build for production |
| `pnpm preview` | Preview production build (port 4173) |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Auto-fix ESLint issues |
| `pnpm type-check` | vue-tsc type checking |
| `pnpm test` | Unit tests (Vitest, watch mode) |
| `pnpm test:ci` | Unit tests with coverage report |
| `pnpm e2e` | E2E tests (runs after build) |
| `pnpm e2e:headed` | E2E tests in headed mode |

## Testing

### Unit Tests

Uses **Vitest** + **jsdom**. Test files are located in the `tests/` directory.

```bash
pnpm test          # Watch mode
pnpm coverage      # Generate coverage report (output to coverage/)
```

Coverage includes core modules: route guards, menu/tab business logic, remote component loaders, and the host bridge layer.

### E2E Tests

Uses **Playwright**. Test files are located in the `e2e/` directory, covering authentication flow, menu navigation, tab operations, and iframe pages.

```bash
pnpm e2e           # Headless mode
pnpm e2e:headed    # Headed mode (Chromium)
pnpm e2e:report    # View test report
```

## Project Structure

```
src/
├── bridge/          # Host communication bridge
├── components/      # Global shared components
├── composables/     # Composition functions (Hooks)
├── config/          # Runtime configuration
├── layouts/         # Layout framework (menu, tabs, theme drawer, etc.)
├── router/          # Route configuration and guards
├── store/           # Pinia stores
├── styles/          # Global styles
├── utils/           # Utilities (remote component loading, HTTP requests, etc.)
├── vendors/         # Vendored third-party dependencies
└── views/           # Page views
    └── _builtin/    # Built-in special pages (UMD container, Iframe container)
```

## License

[MIT License](./LICENSE) © Yu Ziheng
