<p align="center">
  <h1 align="center">Dashboard LightWeight</h1>
  <p align="center">一个基于 Vue 3 + TypeScript + Vite + Tailwind CSS 的轻量级中后台管理系统模板</p>
  <p align="center">A lightweight admin dashboard template built with Vue 3 + TypeScript + Vite + Tailwind CSS</p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License" />
  <img src="https://img.shields.io/badge/vue-3.5-42b883.svg" alt="Vue 3" />
  <img src="https://img.shields.io/badge/vite-7.0-646cff.svg" alt="Vite" />
  <img src="https://img.shields.io/badge/typescript-5.8-3178c6.svg" alt="TypeScript" />
  <img src="https://img.shields.io/badge/tailwindcss-3.4-38bdf8.svg" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/pnpm-8.15+-f69220.svg" alt="pnpm" />
</p>

---

## ✨ 核心特性 / Features

- 🚀 **现代技术栈** — Vue 3.5 + TypeScript 5.8 + Vite 7.0 + Pinia
- 🎨 **原子化样式** — Tailwind CSS 3.4 + FontAwesome 6.7
- 🛣️ **动态路由** — 基于后端接口的动态菜单生成与权限控制
- 🧩 **远程组件** — 支持 UMD 格式远程组件动态加载（Teleport 方案）
- 📱 **多布局主题** — 侧边栏、顶部菜单、混合模式，支持暗色模式
- 📑 **标签页管理** — 多标签页操作 + 右键菜单 + 持久化存储
- 🔒 **权限控制** — 基于 Token 的登录认证与路由守卫
- 🔌 **宿主桥接** — 预留宿主环境通信接入位，按实际集成方案接入

## 🛠️ 技术栈 / Tech Stack

| 类别 | 技术 | 版本 |
|------|------|------|
| 前端框架 | Vue | 3.5.17 |
| 构建工具 | Vite | 7.0.0 |
| 类型系统 | TypeScript | 5.8.0 |
| 状态管理 | Pinia | 2.3.0 |
| 路由管理 | Vue Router | 4.5.1 |
| 样式框架 | Tailwind CSS | 3.4.1 |
| 远程加载 | vendored `vue3-sfc-loader` browser runtime | 与仓库代码同步维护 |
| 包管理器 | pnpm | `>=8.15.0 <9` |

## ✅ 工程能力现状 / Tooling Status

下表描述的是仓库**当前已经落地**的工程能力，而不是目标态。

| 维度 | 当前状态 | 落地位置 |
|------|----------|----------|
| 包管理 | 已统一使用 `pnpm` | `package.json`、`pnpm-lock.yaml` |
| Node / pnpm 版本约束 | 已落地 | `package.json#engines` |
| 类型检查 | 已落地 | `pnpm type-check` / `vue-tsc --build` |
| 单元测试 | 已落地，但覆盖范围仍有限 | `vitest.config.ts`、`tests/**/*.spec.ts` |
| 覆盖率 | 已落地基础阈值 | `vitest.config.ts` |
| 代码格式化配置 | 已落地基础配置 | `.prettierrc`、`.prettierignore` |
| 格式化脚本 | 未单独落地 | 当前仅保留 `Prettier` 配置文件 |
| Lint 规则与检查 | 已落地基础规则 | `eslint.config.mjs`、`pnpm lint` |

## 📁 项目结构 / Project Structure

```
src/
├── bridge/                 # 应用桥接适配层
├── composables/            # 组合式函数 (Hooks)
├── layouts/                # 布局组件
│   ├── base-layout/        # 基础布局框架
│   └── modules/            # 布局模块 (Header, Sider, Tab, Menu)
├── router/                 # 路由配置
│   ├── guards.ts           # 路由守卫 (权限控制)
│   └── routes/             # 动态路由生成逻辑
├── store/                  # Pinia 状态管理
│   └── modules/
│       ├── global-menu/    # 菜单与主题状态
│       └── teleport-manager.ts  # 远程组件渲染管理器
├── styles/                 # 全局样式
├── utils/                  # 工具函数
└── views/                  # 页面视图
    ├── _builtin/           # 内置视图 (IframePage, UMD加载器)
    ├── login/              # 登录页
    └── ...                 # 业务页面
```

## 🚀 快速开始 / Quick Start

### 环境要求 / Prerequisites

- Node.js `^20.19.0` 或 `>=22.12.0`
- pnpm `>=8.15.0 <9`

### 安装与启动 / Install & Run

```bash
# 进入项目目录
cd Dashboard-lightWeight

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

访问 [http://localhost:5173](http://localhost:5173) 查看应用。

### 构建 / Build

```bash
# 构建生产版本
pnpm build

# 预览生产构建
pnpm preview
```

### 常用脚本 / Available Scripts

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动 Vite 开发服务器 |
| `pnpm lint` | 执行 ESLint 基础规则检查 |
| `pnpm lint:fix` | 自动修复可安全修复的 lint 问题 |
| `pnpm type-check` | 执行 TypeScript 类型检查 |
| `pnpm test` | 启动 Vitest 交互模式 |
| `pnpm test:ci` | 执行测试并输出覆盖率结果 |
| `pnpm coverage` | 执行覆盖率统计 |
| `pnpm build` | 先 `type-check`，再执行生产构建 |
| `pnpm preview` | 本地预览构建产物 |

## 🧪 测试与验证 / Testing

### 当前测试能力

- 已接入 `Vitest + jsdom + @vitest/coverage-v8`
- 当前测试覆盖的是第一批高价值链路，不是全量业务覆盖
- 已纳入覆盖率阈值的目标模块：
  - `src/bridge/open-tab-core.ts`
  - `src/router/routes/route-transform.ts`
  - `src/utils/remote-component-loaders.ts`

### 当前建议的本地校验顺序

1. `pnpm install`
2. `pnpm type-check`
3. `pnpm lint`
4. `pnpm test:ci`
5. `pnpm build`

## 📖 功能说明 / Features Guide

### 动态路由与菜单

项目通过全局配置、菜单服务与本地缓存协同生成动态路由。开发阶段默认提供本地 Mock 菜单，接回真实后端时按当前菜单接口与宿主配置接入。

### 远程组件加载 (UMD)

无需重新构建主应用即可扩展功能：
- 使用仓库内 vendored 的 `vue3-sfc-loader` browser runtime 动态编译 `.vue` 文件
- 通过 `<script>` 标签加载 UMD 库
- 使用 `Teleport` 技术渲染远程组件到指定 DOM 节点

### 布局与主题

- **布局切换**：侧边栏布局 / 顶部菜单布局 / 混合布局
- **暗色模式**：一键切换，自动持久化用户偏好
- **标签页**：记录访问历史，支持右键菜单（关闭当前/其它/左侧/右侧/所有）

### 全局配置 (GlobalConfig)

通过 `window.uiGlobalConfig` 进行运行时配置：

| 字段 | 说明 |
|------|------|
| `Origin` | 后端 API 地址 |
| `UserCode` | 当前用户编码 |
| `IsAuthenticated` | 认证状态 |
| `DisplayName` | 系统名称 |
| `PublicLoginUrl` | 公共登录页地址（可选） |

## 🔐 安全部署 / Security Deployment

- 仓库当前已对远程组件来源、跨域 UMD 完整性和 iframe 来源做前端侧白名单收口，但 **完整 CSP 仍需由 Nginx / 静态托管 / 网关通过响应头下发**。
- 推荐的生产基线、来源分级和部署示例见 [docs/CSP安全策略与部署说明.md](./docs/CSP%E5%AE%89%E5%85%A8%E7%AD%96%E7%95%A5%E4%B8%8E%E9%83%A8%E7%BD%B2%E8%AF%B4%E6%98%8E.md)。
- 当前运行时实际涉及的重点来源包括：`'self'`、`https://cdn.jsdelivr.net`、`https://cdnjs.cloudflare.com`，以及按环境配置的远程组件 / iframe 白名单 origin。
- 由于现有页面仍存在内联样式和远程 `.vue` 组件运行时样式注入，当前兼容基线下 `style-src` 仍需要保留 `'unsafe-inline'`；这不是“仓库已完全收紧”的状态。

## 🤝 协作说明 / Collaboration

- 当前仓库已移除与既有代码托管平台绑定的流程配置。
- 如需接入新的代码托管平台或自动化流水线，可按你的团队规范自行补充分支策略与校验流程。

## 📝 开发规范 / Engineering Conventions

### 当前已对齐的约定

- 优先使用 Vue 3 Composition API 与 `script setup`
- 样式以 Tailwind CSS 为主，复杂场景可辅以局部 `scoped` 样式
- 图标使用已集成的 FontAwesome
- `src/utils` 下的工具模块文件名统一使用 `kebab-case`

### 当前基础闭环

- 仓库包含 `.prettierrc` 与 `.prettierignore`
- `pnpm lint` 已形成基础命令闭环

### 当前尚未宣称为“已统一”的项

- 当前 ESLint 以“可执行的基础规则”优先，暂未启用过重的类型感知强规则
- 页面文件命名并未完全统一，当前同时存在 `index.vue`、`SpringLogin.vue` 等形式，不在 README 中宣称已完成统一规范

```vue
<template>
  <i class="fas fa-home"></i>
  <i class="fas fa-chart-line"></i>
</template>
```

## 📌 后续建议 / Next Steps

为让 README、工程规范与仓库能力形成更完整闭环，建议按以下顺序推进：

1. 视团队需要补充 `format` / `format:check` 独立脚本
2. 逐步把 ESLint 从基础规则提升到更细粒度的类型/可维护性规则
3. 视协作规模决定是否接入新的自动化流水线与代码托管平台规范
4. 持续扩大单元测试与 E2E 覆盖范围
5. README 在每次新增工程能力后同步更新，避免再次出现“文档已声明、仓库未落地”

## 📄 License

本项目基于 [MIT License](./LICENSE) 开源。

---

<p align="center">
  如果这个项目对你有帮助，欢迎 ⭐ Star 支持！
</p>
