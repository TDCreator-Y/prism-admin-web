/// <reference types="vite/client" />

// Vue 3 SFC Loader 模块声明
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

// 自定义路由参数管理器
interface CustomRouteParams {
  params: Record<string, string>
  routeId: string
  timestamp: number
}

interface CustomRouteParamsManager {
  [routePath: string]: CustomRouteParams
}

interface HostParameters {
  [key: string]: unknown
}

interface HostCurrentMember {
  DisplayName?: string
  [key: string]: unknown
}

interface HostAppContext {
  CurrentMember?: HostCurrentMember
  [key: string]: unknown
}

interface UiGlobalConfig {
  InternalCode?: string
  UserCode?: string
  UserName?: string
  UseWindowOrigin?: boolean
  Origin?: string
  DisplayName?: string
  Icon?: string
  Scope?: string
  Parameters?: HostParameters
  IsAuthenticated?: boolean
  PublicLoginUrl?: string
  [key: string]: unknown
}

interface AppBridgeOpenTabOptions {
  newTab?: boolean
  activateExisting?: boolean
}

interface AppBridgeLike {
  interfaceType?: string
  open: (url: string, options?: AppBridgeOpenTabOptions) => Promise<boolean>
  openPath?: (path: string, options?: AppBridgeOpenTabOptions) => Promise<boolean>
  openByRouteId?: (routeId: string, options?: AppBridgeOpenTabOptions) => Promise<boolean>
}

interface RemoteComponentLoadStatus {
  status: 'loading' | 'success' | 'partial' | 'error' | 'skipped'
  configUrl: string
  timestamp: number
  successCount?: number
  failureCount?: number
  error?: string
}

interface Window {
  customRouteParamsManager?: CustomRouteParamsManager
  currentCustomRouteKey?: string
  Ext?: unknown
  Vue?: typeof import('vue')
  appBridge?: AppBridgeLike
  remoteComponentLoadStatus?: RemoteComponentLoadStatus
  $pdfjsPreview?: {
    quickPreview: (el: HTMLElement, url: string) => void
  }
  uiGlobalConfig?: UiGlobalConfig
  AppContext?: HostAppContext
  appContext?: HostAppContext
}

interface ImportMetaEnv {
  readonly VITE_BACKEND_ORIGIN: string
  readonly VITE_REMOTE_COMPONENT_ALLOWED_ORIGINS?: string
  readonly VITE_REMOTE_COMPONENT_LOAD_TIMEOUT_MS?: string
  readonly VITE_IFRAME_ALLOWED_ORIGINS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
