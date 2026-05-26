import '@/styles/tailwind.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import * as LayoutComponents from '@/layouts/modules';
// 引入自定义 OpenTab 实现
import { AppOpenTab } from './bridge/app-open-tab';
import {
  REMOTE_COMPONENT_CONFIG_ENDPOINT,
  REMOTE_COMPONENT_SKIP_LOAD_TOKEN,
} from '@/config/remote-components';
import { markUmdComponentsReady } from '@/utils/remote-component-state';

function reportRemoteComponentLoadSetupError(error: unknown) {
  console.error(
    `[RemoteComponents] Failed to start loading from "${REMOTE_COMPONENT_CONFIG_ENDPOINT}":`,
    error
  );
}

async function startRemoteComponentLoading(app: ReturnType<typeof createApp>) {
  const { registerRemoteComponents } = await import('@/utils/remote-component-loader');
  await registerRemoteComponents(app, REMOTE_COMPONENT_CONFIG_ENDPOINT);
}

function markRemoteComponentLoadingSkipped() {
  window.remoteComponentLoadStatus = {
    status: 'skipped',
    configUrl: REMOTE_COMPONENT_SKIP_LOAD_TOKEN,
    timestamp: Date.now(),
  };
  markUmdComponentsReady();
}

const initApp = async () => {
  const app = createApp(App);

  // 注册布局全局组件
  for (const [key, component] of Object.entries(LayoutComponents)) {
    if (component) {
      app.component(key, component);
    }
  }

  // 安装 Pinia
  const pinia = createPinia();
  app.use(pinia);

  // 注册 appBridge 自定义实现（在挂载前）
  window.appBridge = new AppOpenTab(pinia);
  console.log('[AppBridge] 自定义 OpenTab 实现已注册');

  // 动态加载远程组件 (改为后台加载，不阻塞应用挂载)
  // 如果处于未登录状态，且当前路由是登录页，则不加载 UMD 组件，避免重复加载
  const isLoginPage =
    window.location.hash.includes('/login') ||
    window.location.hash.includes('/SpringLogin');
  const uiConfig = window.uiGlobalConfig ?? {};
  const isAuthenticated = uiConfig.IsAuthenticated === true;

  if (isAuthenticated || !isLoginPage) {
    try {
      console.log('Start loading remote components in background...');
      startRemoteComponentLoading(app).catch(reportRemoteComponentLoadSetupError);
    } catch (e) {
      reportRemoteComponentLoadSetupError(e);
    }
  } else {
    console.log('On login page and not authenticated, skipping UMD component loading.');
    // 登录页未登录场景只标记跳过与 ready，避免提前引入远程组件加载链。
    markRemoteComponentLoadingSkipped();
  }

  // 安装路由 (放在远程组件加载之后，避免潜在的冲突)
  app.use(router);

  app.mount('#app');
};

initApp();

