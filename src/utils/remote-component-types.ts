export interface RemoteComponentDetail {
  name: string;
  tag?: string;
  zhName?: string;
  displayName?: string;
  title?: string;
  icon?: string;
  description?: string;
  [key: string]: unknown;
}

export interface RemoteComponentManifest {
  zhName?: string;
  version?: string;
  author?: string;
  description?: string;
  componentsMap?: Record<string, string>;
  componentsDetailed?: RemoteComponentDetail[];
  [key: string]: unknown;
}

export interface RemoteComponentModule extends Record<string, unknown> {
  install?: (...args: unknown[]) => unknown;
  manifest?: RemoteComponentManifest;
  componentsMap?: Record<string, string>;
  componentsDetailed?: RemoteComponentDetail[];
}

export interface RemoteLibraryInfo {
  name: string;
  url: string;
  status: 'pending' | 'loading' | 'success' | 'error';
  error?: string;
  manifest?: RemoteComponentManifest;
  componentsMap?: Record<string, string>;
  componentsDetailed?: RemoteComponentDetail[];
  componentKeys?: string[];
  registeredCount?: number;
}

export interface ComponentConfig {
  name: string;
  type: 'umd' | 'esm';
  version: string;
  path: string;
  globalName?: string;
  integrity?: string;
  dependencies?: string[];
  autoRegister?: boolean;
  metadata?: {
    zhName?: string;
    componentsDetailed?: RemoteComponentDetail[];
  };
}

export interface Config {
  components: ComponentConfig[];
}
