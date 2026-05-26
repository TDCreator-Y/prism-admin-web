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
