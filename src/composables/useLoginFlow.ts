import { useRoute, useRouter } from 'vue-router';
import { reloadDynamicRoutes } from '@/router';
import { setGlobalConfig } from '@/router/routes';

export interface LoginCredentials {
  username: string;
  password: string;
}

export type LoginRequestHandler<T = unknown> = (credentials: LoginCredentials) => Promise<T>;

function ensureUiGlobalConfig() {
  if (!window.uiGlobalConfig) {
    window.uiGlobalConfig = {};
  }
  return window.uiGlobalConfig;
}

function markAuthenticated() {
  setGlobalConfig({ IsAuthenticated: true });
  ensureUiGlobalConfig().IsAuthenticated = true;
}

function resolveRedirectTarget(rawRedirect?: string): string {
  if (!rawRedirect) {
    return '/';
  }

  if (rawRedirect.startsWith('/')) {
    return rawRedirect;
  }

  try {
    const url = new URL(rawRedirect);
    return url.hash?.startsWith('#/') ? url.hash.substring(1) : '/';
  } catch {
    return '/';
  }
}

function markReloadAfterLogin() {
  if (import.meta.env.PROD) {
    sessionStorage.setItem('need_reload_after_login', 'true');
    // 持久化认证状态，确保 reload 后路由守卫仍能读到 IsAuthenticated=true
    sessionStorage.setItem('prism_post_login_auth', 'true');
  }
}

export function useLoginFlow() {
  const router = useRouter();
  const route = useRoute();

  async function completeLogin() {
    markAuthenticated();
    await reloadDynamicRoutes();

    const redirect = resolveRedirectTarget(route.query.redirect as string | undefined);
    markReloadAfterLogin();
    await router.replace(redirect);
  }

  async function login<T = unknown>(
    credentials: LoginCredentials,
    requestHandler: LoginRequestHandler<T>
  ): Promise<T> {
    const result = await requestHandler(credentials);
    await completeLogin();
    return result;
  }

  return {
    login,
    completeLogin,
    resolveRedirectTarget,
  };
}
