# UMD 组件开发与集成完整指南

本文档覆盖从克隆 `prism-umd-template` 到最终在 `prism-admin-web` 中加载组件的完整链路。

---

## 目录

1. [克隆与环境配置](#1-克隆与环境配置)
2. [项目结构速览](#2-项目结构速览)
3. [开发新组件](#3-开发新组件)
4. [给 AI 的提示词](#4-给-ai-的提示词)
5. [打包构建](#5-打包构建)
6. [集成到 prism-admin-web](#6-集成到-prism-admin-web)
7. [验证与调试](#7-验证与调试)

---

## 1. 克隆与环境配置

### 环境要求

| 工具 | 版本要求 |
|------|---------|
| Node.js | `>=18.0.0` |
| pnpm | `>=10.x` |

### 克隆与安装

```bash
git clone https://github.com/TDCreator-Y/prism-umd-template.git
cd prism-umd-template
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

浏览器打开 `http://localhost:5173`，可以看到 `src/dev/App.vue` 中配置的组件演示页面。

> **注意**：`src/dev/` 目录只用于本地预览，不会被打包进 UMD 产物。

---

## 2. 项目结构速览

```
src/
├── build/                  # ← 打包产物来源（只改这里）
│   ├── components/         # 业务组件（每个 .vue 文件 = 一个组件）
│   │   └── index.ts        # 统一导出
│   ├── composables/        # 可复用组合式函数
│   ├── types/              # TypeScript 类型（含 Manifest 接口）
│   └── utils/              # 工具函数（含 getBridge）
├── dev/                    # 开发沙箱（不打包）
│   └── App.vue             # 本地预览入口
└── build.ts                # 库入口：withWrapper 注册 + manifest 定义

rules/
├── CLAUDE.md               # AI 编码规范（Claude Code 自动加载）
└── ui-design.md            # UI 设计规范
```

---

## 3. 开发新组件

每次新增一个组件需要完成 **三个文件** 的修改，缺一不可。

### Step 1：创建组件文件

新建 `src/build/components/MyComponent.vue`，使用以下模板：

```vue
<template>
  <div :class="{ dark: isDark }" class="w-full">
    <div class="bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-6 rounded-xl border border-slate-200 dark:border-slate-700">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold flex items-center gap-2">
          <i class="fas fa-cube text-indigo-500"></i>
          <span>{{ title }}</span>
        </h2>
      </div>
      <div class="space-y-4">
        <!-- 组件内容 -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Manifest } from '@/build/types'

export interface Props {
  title?: string
  theme?: 'light' | 'dark'
}

const manifest: Manifest = {
  name: 'MyComponent',
  type: 'component',
  description: '组件功能描述',
  version: '1.0.0',
  author: '郁子恒',
}

const props = withDefaults(defineProps<Props>(), {
  title: '标题',
  theme: 'light',
})

defineEmits<{
  confirm: []
}>()

const isDark = computed(() => props.theme === 'dark')

defineExpose({ manifest })
</script>
```

### Step 2：添加到导出文件

编辑 `src/build/components/index.ts`：

```typescript
import ThemeSwitchTest from './ThemeSwitchTest.vue'
import MyComponent from './MyComponent.vue'       // ← 新增

export { ThemeSwitchTest, MyComponent }           // ← 新增到 export
```

### Step 3：注册到库入口并更新 Manifest

编辑 `src/build.ts`，找到对应位置依次添加：

```typescript
// 1. 导入
import { ThemeSwitchTest as _ThemeSwitchTest, MyComponent as _MyComponent } from '@/build/components'

// 2. 用 withWrapper 包裹（自动添加样式隔离容器）
const ThemeSwitchTest = withWrapper(_ThemeSwitchTest)
const MyComponent = withWrapper(_MyComponent)        // ← 新增

// 3. 加入 components 对象
const components = {
  ThemeSwitchTest,
  MyComponent,                                       // ← 新增
}

// 4. 在 manifest 中补充条目
export const manifest = {
  // ...
  componentsMap: {
    ThemeSwitchTest: '主题切换测试组件',
    MyComponent: '我的组件描述',                     // ← 新增
  },
  componentsDetailed: [
    { name: 'ThemeSwitchTest', zhName: '主题测试', icon: 'fas fa-palette', description: '...' },
    { name: 'MyComponent', zhName: '我的组件', icon: 'fas fa-cube', description: '组件功能描述' }, // ← 新增
  ],
}
```

> **重要**：`componentsDetailed` 中的 `zhName` 会直接显示在 prism-admin-web 的侧边栏菜单中，`icon` 使用 FontAwesome 类名（格式：`fas fa-xxx`）。

### 在开发沙箱中预览

编辑 `src/dev/App.vue`，引入组件并渲染：

```vue
<script setup lang="ts">
import MyComponent from '@/build/components/MyComponent.vue'
</script>

<template>
  <div class="p-8 space-y-6">
    <MyComponent title="测试标题" theme="light" />
    <MyComponent title="测试标题" theme="dark" />
  </div>
</template>
```

---

## 4. 给 AI 的提示词

使用 Trae、Cursor 等 AI 工具开发时，**首先手动导入以下文件作为上下文**：

| 优先级 | 文件 | 用途 |
|--------|------|------|
| ★★★ | `rules/CLAUDE.md` | 完整编码规范 |
| ★★★ | `rules/ui-design.md` | UI 设计规范与代码片段 |
| ★★★ | `src/build.ts` | 理解导出结构和 manifest 格式 |
| ★★ | `src/build/types/manifest.ts` | Manifest 接口定义 |
| ★ | `src/build/components/ThemeSwitchTest.vue` | 标准组件参考示例 |

### 通用组件生成提示词

直接复制以下提示词，替换 `【】` 内的内容：

```
请在 prism-umd-template 项目中创建一个 Vue 3 UMD 组件：

【组件功能】
在此描述组件的用途和核心功能

【Props 设计】
- theme: 'light' | 'dark'（必须有，用于暗黑模式切换）
- 其他 props...

【Emits 设计】
- 需要触发的事件（如无则省略）

【UI 要求】
- 布局：卡片式 / 列表式 / 表格式（选一个）
- 数据展示：（描述需要展示什么数据）

【严格约束】
- 文件路径：src/build/components/[ComponentName].vue（PascalCase）
- 使用 <script setup lang="ts">，import type { Manifest }
- defineEmits 必须用类型声明形式，不能用数组
- 所有颜色 Tailwind 类必须同时写 dark: 版本
- manifest 常量必须存在，并在 defineExpose({ manifest }) 中暴露
- Props 接口必须 export

完成后请给出：
1. 完整的 .vue 文件内容
2. src/build/components/index.ts 的修改内容
3. src/build.ts 中 import、withWrapper、components、componentsMap、componentsDetailed 的修改内容
```

### ECharts 图表组件提示词

```
请创建一个包含 ECharts 图表的 Vue 3 UMD 组件：

【图表类型】折线图 / 柱状图 / 饼图（选一个）
【数据结构】（描述 props 中传入的数据格式）

【约束】
- import * as echarts from 'echarts'（构建时外部化，不打包）
- onBeforeUnmount 中必须调用 chart?.dispose()
- 监听容器 resize，节流 150ms
- 主题通过 props.theme 控制（'light' | 'dark'）
- 所有 Tailwind 颜色类必须有 dark: 版本

请给出完整组件代码及 src/build.ts 的注册步骤。
```

### 数据请求组件提示词

```
请创建一个需要请求后端数据的 Vue 3 UMD 组件：

【接口】URL: /api/xxx，Method: GET
【返回数据结构】（描述 JSON 格式）

【约束】
- 数据请求必须通过 getBridge()：
  import { getBridge } from '@/build/utils'
  const bridge = getBridge()
  if (!bridge) return
  const data = await bridge.request({ url: '/api/xxx', method: 'GET' })
- 必须有 loading 状态（显示 spinner 或骨架屏）
- 必须有错误处理（显示友好提示）

请给出完整组件代码及注册步骤。
```

---

## 5. 打包构建

### 打包前检查

```bash
pnpm type-check     # 确保 TypeScript 无报错
pnpm lint           # 确保代码规范无问题
pnpm test           # 确保单元测试通过
```

### 执行打包

```bash
pnpm build
```

构建成功后，产物位于：

```
dist/
└── kivii-component-demo-library.umd.js   # 唯一产物，CSS 已内联
```

> 如果需要类型检查后再打包（更严格）：
> ```bash
> pnpm build:check
> ```

### 验证产物

打包后可以用 `umd-test.html` 在浏览器中快速验证产物是否正常工作：

```bash
# 先启动一个本地服务器（在 dist/ 目录上层）
pnpm preview
# 或使用 VS Code Live Server 打开 umd-test.html
```

---

## 6. 集成到 prism-admin-web

### Step 1：复制 UMD 文件

将构建产物复制到 prism-admin-web 的 `public/umd/` 目录，**文件名自定义**（建议语义化命名）：

```
prism-admin-web/
└── public/
    └── umd/
        └── my-component.umd.js    ← 复制到这里
```

> `public/umd/` 目录下的文件在开发和生产环境均通过 `/umd/文件名` 路径静态访问。

### Step 2：注册组件配置

编辑 `prism-admin-web/src/utils/remote-component-config.ts`，在 `components` 数组中添加新条目：

```typescript
export const loadConfig = async (_configPath: string): Promise<Config> => {
  return {
    components: [
      // 已有的组件...
      {
        name: 'MyLib',                          // 库的唯一标识（英文，不含空格）
        type: 'umd',
        version: '1.0.0',
        path: '/umd/my-component.umd.js',       // 与 public/umd/ 下的文件名对应
        globalName: 'VueComponent',             // 必须与 vite.config.ts 中 build.lib.name 一致
        autoRegister: true,                     // 自动注册所有组件到 Vue 全局
        metadata: {
          zhName: '我的业务组件库',              // 显示在侧边栏一级菜单的名称
        },
      },
    ],
  };
};
```

**字段说明：**

| 字段 | 必填 | 说明 |
|------|------|------|
| `name` | ✓ | 库的唯一标识，作为路由前缀 `/umd/{name}/` |
| `type` | ✓ | 固定填 `'umd'` |
| `version` | ✓ | 版本号，用于缓存管理 |
| `path` | ✓ | 相对于域名根路径的 URL，对应 `public/umd/` 下的文件 |
| `globalName` | ✓ | UMD 全局变量名，必须与 `vite.config.ts` 的 `build.lib.name` 一致（默认 `VueComponent`） |
| `autoRegister` | ✓ | 填 `true`，自动调用 `app.use()` 注册所有组件 |
| `metadata.zhName` | — | 侧边栏一级菜单显示名称 |

### Step 3：菜单与路由自动生成

prism-admin-web 会在启动时自动完成以下流程，**无需手动配置路由或菜单**：

```
加载 UMD 文件
    ↓
读取 window.VueComponent.manifest.componentsDetailed
    ↓
为每个组件生成路由 /umd/{libName}/{componentName}
    ↓
侧边栏自动显示菜单项（使用 zhName 和 icon）
    ↓
点击菜单项 → UmdComponent 视图渲染对应组件
```

菜单项的名称和图标完全由 `src/build.ts` 中 `manifest.componentsDetailed` 的内容决定：

```typescript
// prism-umd-template/src/build.ts
componentsDetailed: [
  {
    name: 'MyComponent',       // 组件注册名（必须与 export 名一致）
    zhName: '我的组件',        // ← 侧边栏显示的中文名称
    icon: 'fas fa-cube',       // ← 侧边栏图标（FontAwesome 类名）
    description: '组件功能描述',
  },
]
```

---

## 7. 验证与调试

### 启动 prism-admin-web 开发服务器

```bash
cd prism-admin-web
pnpm dev
```

### 验证清单

- [ ] 浏览器控制台无 `组件加载失败` 或 `未找到 VueComponent` 等报错
- [ ] 侧边栏出现新的菜单组（名称来自 `metadata.zhName`）
- [ ] 点击菜单项，组件正常渲染
- [ ] Light / Dark 模式切换后，组件样式正确响应
- [ ] 打开多个标签页，组件独立互不影响

### 常见问题

**问题 1：侧边栏没有出现新菜单**

检查点：
1. `remote-component-config.ts` 中的 `path` 是否与 `public/umd/` 下的文件名完全一致
2. 浏览器控制台是否有加载错误（网络超时、404 等）
3. `src/build.ts` 的 `componentsDetailed` 是否有内容

**问题 2：组件渲染空白或报错**

检查点：
1. `globalName` 是否与 UMD 文件的全局变量名匹配（打开 dist 文件搜索 `factory`，确认 `root["VueComponent"]`）
2. 宿主页面是否提供了必要的外部依赖（Vue 由 prism-admin-web 提供，无需额外处理）

**问题 3：Dark Mode 不生效**

检查点：
1. 组件模板中是否绑定了 `:class="{ dark: isDark }"`（需要在组件根元素上加）
2. 所有颜色 Tailwind 类是否都有对应的 `dark:` 版本

**问题 4：数据请求失败**

检查点：
1. 组件中是否使用了 `getBridge()` 而非 `fetch/axios`
2. prism-admin-web 是否处于 Mock 模式（`src/utils/http.ts` 中可确认）
