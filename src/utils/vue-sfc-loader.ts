import type { DefineComponent } from 'vue';

export interface LoadVueSfcModuleOptions {
  moduleCache: Record<string, unknown>;
  getFile: (url: string) => Promise<string>;
  addStyle?: (textContent: string) => void;
}

interface VueSfcLoaderRuntimeModule {
  loadModule: (
    url: string,
    options: LoadVueSfcModuleOptions
  ) => Promise<DefineComponent<object, object, unknown>>;
}

let runtimeModulePromise: Promise<VueSfcLoaderRuntimeModule> | null = null;

function getVueSfcLoaderRuntimeUrl(): string {
  const runtimePath = `${import.meta.env.BASE_URL}vendors/vue3-sfc-loader.esm.js`;
  return new URL(runtimePath, window.location.origin).toString();
}

async function getVueSfcLoaderRuntime(): Promise<VueSfcLoaderRuntimeModule> {
  if (!runtimeModulePromise) {
    runtimeModulePromise = import(
      /* @vite-ignore */ getVueSfcLoaderRuntimeUrl()
    ) as Promise<VueSfcLoaderRuntimeModule>;
  }

  return runtimeModulePromise;
}

export async function loadVueSfcModule(
  url: string,
  options: LoadVueSfcModuleOptions
): Promise<DefineComponent<object, object, unknown>> {
  const runtime = await getVueSfcLoaderRuntime();
  return runtime.loadModule(url, options);
}

export function resolveVueComponentRequestPath(fullUrl: string): string {
  const resolvedUrl = new URL(fullUrl, window.location.origin);

  if (!resolvedUrl.pathname.toLowerCase().endsWith('.vue')) {
    throw new Error(`仅允许加载 .vue 组件资源: ${resolvedUrl.pathname}`);
  }

  return `${resolvedUrl.pathname}${resolvedUrl.search}`;
}
