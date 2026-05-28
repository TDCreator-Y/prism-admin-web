import { ref } from 'vue';
import type { GlobalConfig } from './types';

function ensureUiGlobalConfig(): UiGlobalConfig {
  if (!window.uiGlobalConfig) {
    window.uiGlobalConfig = {};
  }
  return window.uiGlobalConfig;
}

// 默认全局配置
const uiConfig = ensureUiGlobalConfig();

// 登录后 reload 场景：reload 前已将认证状态写入 sessionStorage，此处恢复以避免路由守卫误判为未登录
if (sessionStorage.getItem('prism_post_login_auth') === 'true') {
  sessionStorage.removeItem('prism_post_login_auth');
  uiConfig.IsAuthenticated = true;
}

const defaultGlobalConfig: GlobalConfig = {
  InternalCode: uiConfig.InternalCode || 'umdDashboard',
  UserCode: uiConfig.UserCode || 'admin',
  UserName: uiConfig.UserName || '管理员',
  UseWindowOrigin: uiConfig.UseWindowOrigin !== undefined ? uiConfig.UseWindowOrigin : true,
  Origin:
    uiConfig.Origin ||
    (uiConfig.UseWindowOrigin !== false
      ? window.location.origin
      : import.meta.env.VITE_BACKEND_ORIGIN) ||
    '',
  DisplayName: uiConfig.DisplayName || '',
  Icon: uiConfig.Icon || '',
  Scope: uiConfig.Scope || '',
  Parameters: uiConfig.Parameters || {},
  IsAuthenticated: uiConfig.IsAuthenticated !== undefined ? uiConfig.IsAuthenticated : false,
  PublicLoginUrl: uiConfig.PublicLoginUrl || '',
};

// 当前全局配置
const globalConfig = ref<GlobalConfig>({ ...defaultGlobalConfig });

// 设置全局配置
export function setGlobalConfig(config: Partial<GlobalConfig>) {
  globalConfig.value = { ...globalConfig.value, ...config };
}

// 获取全局配置
export function getGlobalConfig(): GlobalConfig {
  return globalConfig.value;
}
