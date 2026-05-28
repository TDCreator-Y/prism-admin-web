# 动态加载远程组件实现方案

本文档说明动态加载远程组件（UMD/ESM）的核心实现，该功能由以下专用工具模块负责：

| 文件 | 职责 |
|------|------|
| `src/utils/remote-component-types.ts` | 接口与类型定义 |
| `src/utils/remote-component-loaders.ts` | UMD / ESM 加载逻辑 |
| `src/utils/remote-component-registrar.ts` | 组件注册到 Vue 应用实例 |
| `src/utils/remote-component-config.ts` | 配置文件读取 |
| `src/utils/remote-component-state.ts` | 已加载库的运行时状态 |
| `src/config/remote-components.ts` | 静态组件端点配置 |

该方案支持通过 JSON 配置文件动态注册 Vue 组件，适用于微前端或插件化架构。

## 1. 核心接口定义

定义了组件配置的数据结构，支持区分 UMD 和 ESM 两种模块类型（位于 `src/utils/remote-component-types.ts`）。

```typescript
export interface ComponentConfig {
  name: string;
  type: 'umd' | 'esm';
  version: string;
  path: string;
  globalName?: string;       // UMD 组件在全局对象中的名称（如 VueComponent）
  integrity?: string;        // SRI 完整性校验哈希
  dependencies?: string[];   // 组件依赖的其他资源
  autoRegister?: boolean;    // 是否自动注册到 Vue 应用
  metadata?: {
    zhName?: string;
    componentsDetailed?: RemoteComponentDetail[];
  };
}

export interface Config {
  components: ComponentConfig[];
}
```

## 2. 配置文件加载

从服务器获取组件清单。
**注意**：请根据实际情况修改 `fetch` 的 URL 地址。

```typescript
// 加载配置文件
const loadConfig = async (): Promise<Config> => {
  try {
    // ⚠️ 请在此处配置您的组件清单 JSON 文件地址
    const response = await fetch('/codes/umdComponents.json');
    if (!response.ok) {
      throw new Error(`配置文件加载失败: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to load config:', error);
    throw error;
  }
};
```

**配置文件示例 (`umdComponents.json`)**:
```json
{
  "components": [
    {
      "name": "MyRemoteComponent",
      "type": "umd",
      "version": "1.0.0",
      "path": "http://cdn.example.com/my-component.umd.js",
      "globalName": "MyComponentGlobalName"
    },
    {
      "name": "MyESMComponent",
      "type": "esm",
      "version": "1.0.0",
      "path": "http://cdn.example.com/my-component.mjs"
    }
  ]
}
```

## 3. 核心加载逻辑

### 3.1 加载 UMD 组件
通过动态创建 `<script>` 标签加载 UMD 格式的组件，并从 `window` 对象上获取导出的组件。

```typescript
// 动态加载远程UMD组件的函数
const loadUMDComponent = (url: string, globalName?: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    // 检查是否已经加载过该脚本
    const existingScript = document.querySelector(`script[src="${url}"]`);
    if (existingScript) {
      // 如果已经加载，直接返回全局组件
      const component = (window as any)[globalName || 'VueComponent'];
      if (component) {
        resolve(component);
        return;
      }
    }

    const script = document.createElement('script');
    script.src = url;
    script.onload = () => {
      // UMD组件加载完成后，从全局对象中获取组件
      // 默认全局变量名为 VueComponent，可通过配置覆盖
      const component = (window as any)[globalName || 'VueComponent'];
      if (component) {
        resolve(component);
      } else {
        reject(new Error(`组件加载失败：未找到${globalName || 'VueComponent'} from ${url}`));
      }
    };
    script.onerror = () => reject(new Error(`脚本加载失败: ${url}`));
    document.head.appendChild(script);
  });
};
```

### 3.2 加载 ESM 组件
使用原生 `import()` 语法加载 ES Module 格式的组件。

```typescript
// 动态加载ESM组件的函数
const loadESMComponent = async (url: string): Promise<any> => {
  try {
    /* @vite-ignore */ // 忽略 Vite 对动态导入的警告
    const module = await import(url);
    return module.default || module;
  } catch (error) {
    throw new Error(`ESM组件加载失败: ${url} - ${error}`);
  }
};
```

### 3.3 通用分发器
根据配置类型选择合适的加载策略。

```typescript
// 通用组件加载器
const loadComponent = async (componentConfig: ComponentConfig): Promise<any> => {
  const { type, path, globalName } = componentConfig;

  switch (type) {
    case 'umd':
      return await loadUMDComponent(path, globalName);
    case 'esm':
      return await loadESMComponent(path);
    default:
      throw new Error(`不支持的组件类型: ${type}`);
  }
};
```

## 4. 组件注册逻辑

将加载回来的组件注册到 Vue 应用实例中（位于 `src/utils/remote-component-registrar.ts`）。

注意：`registerComponent` 需要将 `app` 实例作为第一个参数传入。

```typescript
// 注册单个组件
export const registerComponent = async (app: App, componentConfig: ComponentConfig) => {
  try {
    const remoteComponent = await loadComponent(componentConfig);

    // 1. 插件模式：如果组件有 install 方法，使用 app.use()
    if (remoteComponent.install) {
      app.use(remoteComponent);
    }
    // 2. 具名导出模式：如果组件对象包含与 name 匹配的属性
    else if (remoteComponent[componentConfig.name]) {
      app.component(componentConfig.name, remoteComponent[componentConfig.name]);
    }
    // 3. 直接组件模式：直接注册返回的对象
    else {
      app.component(componentConfig.name, remoteComponent);
    }
  } catch (error) {
    console.error(`Failed to load component ${componentConfig.name}:`, error);
    throw error;
  }
};
```

## 5. 批量注册与初始化

并行加载配置文件中的所有组件，并统计成功/失败情况。

```typescript
// 注册所有远程组件
const registerRemoteComponents = async () => {
  try {
    const config = await loadConfig();
    console.log('Config loaded:', config);

    if (!config.components || config.components.length === 0) {
      console.warn('No components found in config');
      return;
    }

    // 记录加载结果
    const loadResults: Array<{ name: string; success: boolean; error?: string }> = [];

    // 并行加载所有组件
    const loadPromises = config.components.map(async componentConfig => {
      try {
        await registerComponent(componentConfig);
        loadResults.push({ name: componentConfig.name, success: true });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        loadResults.push({
          name: componentConfig.name,
          success: false,
          error: errorMessage
        });
      }
    });

    await Promise.allSettled(loadPromises);

    // 输出加载结果统计
    const successCount = loadResults.filter(r => r.success).length;
    const failureCount = loadResults.filter(r => !r.success).length;

    console.log(`Component loading completed: ${successCount} successful, ${failureCount} failed`);

    if (failureCount > 0) {
      console.warn(
        'Failed components:',
        loadResults.filter(r => !r.success)
      );
    }

    // 如果所有组件都加载失败，抛出错误
    if (successCount === 0 && failureCount > 0) {
      throw new Error('All components failed to load');
    }
  } catch (error) {
    console.error('Failed to register remote components:', error);
    throw error;
  }
};
```

## 6. 应用启动流程

远程组件加载在应用启动时异步执行，不阻塞主流程挂载。具体协调逻辑位于 `src/router/routes/dynamic-routes.ts` 的 `generateDynamicRoutes()`，它会等待远程组件注册完成后再生成动态路由。

```typescript
// src/router/routes/dynamic-routes.ts（示意）
export async function generateDynamicRoutes() {
  // 等待远程 UMD 组件注册完成
  await waitForRemoteComponents();

  // 再尝试从缓存恢复或重新拉取菜单数据
  // ...
}
```

即使部分组件加载失败，应用仍可正常启动，失败的组件会记录错误状态，不影响其他功能。
