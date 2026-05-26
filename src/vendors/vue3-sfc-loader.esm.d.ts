import type { DefineComponent } from 'vue';

export interface LoadModuleOptions {
  moduleCache: Record<string, unknown>;
  getFile: (url: string) => Promise<string>;
  addStyle?: (textContent: string) => void;
}

export function loadModule(
  url: string,
  options: LoadModuleOptions
): Promise<DefineComponent<object, object, unknown>>;
