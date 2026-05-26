import type { Router } from 'vue-router';
import { waitForRoutesReady, isDynamicRoutesReady, setTargetNavigation } from './index';
import { getGlobalConfig } from '@/router/routes';
import { useMenuStore } from '@/layouts/modules/global-menu/store';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { readJsonStorage, STORAGE_KEY_CANDIDATES } from '@/utils/storage-keys';

// 配置 NProgress
NProgress.configure({ showSpinner: false });

// 路由守卫配置
const guardsConfig = {
  enabled: true,
  defaultTitle: 'Prism',
};

export function setupRouteGuards(router: Router) {
  if (!guardsConfig.enabled) {
    return;
  }

  router.beforeEach(async (to, from, next) => {
    // 开始进度条
    NProgress.start();

    // 根据主题配置动态修改进度条颜色
    try {
      const theme = readJsonStorage<Record<string, unknown>>(STORAGE_KEY_CANDIDATES.theme, {});
      if (typeof theme.primaryColor === 'string') {
        const root = document.documentElement;
        root.style.setProperty('--nprogress-color', theme.primaryColor);
      }
    } catch {
      // ignore
    }
    // 检查是否已登录
    const config = getGlobalConfig();
    const loginPaths = ['/login', '/SpringLogin'];
    
    // 如果未登录且当前访问的不是登录页面
    if (!config.IsAuthenticated && !loginPaths.includes(to.path)) {
      // 1. 如果配置了公共登录页（PublicLoginUrl），则跳往公共登录页
      if (config.PublicLoginUrl) {
        // 构造带回跳地址的公共登录页 URL，便于公共登录成功后能跳回本系统
        const redirectUrl = encodeURIComponent(window.location.href);
        const targetUrl = config.PublicLoginUrl.includes('?') 
          ? `${config.PublicLoginUrl}&redirect=${redirectUrl}` 
          : `${config.PublicLoginUrl}?redirect=${redirectUrl}`;
          
        window.location.href = targetUrl;
        return;
      }
      
      // 2. 否则按原有流程，跳转到系统自带的登录页
      next('/login');
      return;
    }

    if (!isDynamicRoutesReady()) {
      let targetPath = to.path;
      const hash = window.location.hash;
      if (hash && hash.startsWith('#/') && hash.length > 2) {
        targetPath = hash.substring(1);
      }
      setTargetNavigation(targetPath);
    }

    if (loginPaths.includes(to.path)) {
      return next();
    }

    if ((to.path === '/404' || to.path.startsWith('/:pathMatch')) && !isDynamicRoutesReady()) {
      let targetPath = '/';
      const hash = window.location.hash;
      if (hash && hash.startsWith('#/') && hash.length > 2) {
        targetPath = hash.substring(1);
      }
      setTargetNavigation(targetPath);
      await waitForRoutesReady();
      return next(targetPath);
    }

    if (!isDynamicRoutesReady()) {
      await waitForRoutesReady();
    }

    const title = (to.meta?.title as string) || guardsConfig.defaultTitle;
    if (title) {
      document.title = title;
    }

    const menuStore = useMenuStore();

    menuStore.setSelectedKey(to.path);

    const menuItem = {
      key: (to.name as string) || to.path,
      path: to.path,
      title: title,
      icon: to.meta?.icon as string,
    };
    menuStore.addTab(menuItem);

    next();
  });

  router.afterEach((_to, _from) => {
    NProgress.done();
  });
}

export { guardsConfig };

