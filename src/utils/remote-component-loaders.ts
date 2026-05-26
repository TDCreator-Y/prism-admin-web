import {
  REMOTE_COMPONENT_LOAD_TIMEOUT_MS,
  validateRemoteComponentResource,
} from '@/config/remote-components';
import type { ComponentConfig } from './remote-component-types';

// 将 UMD IIFE 注入的 <style> 移到 dashboard 自身 CSS 之前，
// 避免 UMD 的主题变量/dark 选择器因级联位置靠后而覆盖项目样式
export const relocateUmdStyles = (existingStyleSet: Set<Element>): void => {
  const newStyles = Array.from(document.head.querySelectorAll('style')).filter(
    s => !existingStyleSet.has(s)
  );

  if (newStyles.length === 0) return;

  const firstAppCss =
    document.head.querySelector('link[rel="stylesheet"]') ??
    Array.from(existingStyleSet).find(s => s.parentNode === document.head) ??
    null;

  if (firstAppCss) {
    for (const style of newStyles) {
      document.head.insertBefore(style, firstAppCss);
    }
  }
};

function getWindowGlobalValue(globalName: string): unknown {
  const windowWithGlobals = window as unknown as Window & Record<string, unknown>;
  return windowWithGlobals[globalName];
}

export const loadUMDComponent = (
  url: string,
  globalName?: string,
  integrity?: string
): Promise<unknown> => {
  return new Promise((resolve, reject) => {
    const validatedUrl = validateRemoteComponentResource(url, {
      type: 'umd',
      integrity,
    });
    const normalizedUrl = validatedUrl.toString();
    const resolvedGlobalName = globalName || 'VueComponent';
    const existingScript = document.querySelector(`script[src="${normalizedUrl}"]`);
    if (existingScript) {
      const component = getWindowGlobalValue(resolvedGlobalName);
      if (component) {
        resolve(component);
        return;
      }
    }

    const existingStyles = new Set<Element>(document.head.querySelectorAll('style'));

    const script = document.createElement('script');
    const timeoutId = window.setTimeout(() => {
      script.remove();
      reject(
        new Error(
          `脚本加载超时(${REMOTE_COMPONENT_LOAD_TIMEOUT_MS}ms): ${normalizedUrl}`
        )
      );
    }, REMOTE_COMPONENT_LOAD_TIMEOUT_MS);

    script.src = normalizedUrl;
    script.async = true;
    script.crossOrigin = 'anonymous';
    if (integrity) {
      script.integrity = integrity;
    }
    script.onload = () => {
      window.clearTimeout(timeoutId);
      relocateUmdStyles(existingStyles);

      const component = getWindowGlobalValue(resolvedGlobalName);
      if (component) {
        resolve(component);
      } else {
        reject(
          new Error(
            `组件加载失败：未找到${resolvedGlobalName} from ${normalizedUrl}`
          )
        );
      }
    };
    script.onerror = () => {
      window.clearTimeout(timeoutId);
      reject(new Error(`脚本加载失败: ${normalizedUrl}`));
    };
    document.head.appendChild(script);
  });
};

export const loadESMComponent = async (url: string): Promise<unknown> => {
  try {
    const validatedUrl = validateRemoteComponentResource(url, { type: 'esm' });
    const module = await import(/* @vite-ignore */ validatedUrl.toString());
    return module.default || module;
  } catch (error) {
    throw new Error(`ESM组件加载失败: ${url} - ${error}`);
  }
};

export const loadComponent = async (componentConfig: ComponentConfig): Promise<unknown> => {
  const { type, path, globalName, integrity } = componentConfig;

  switch (type) {
    case 'umd':
      return await loadUMDComponent(path, globalName, integrity);
    case 'esm':
      return await loadESMComponent(path);
    default:
      throw new Error(`不支持的组件类型: ${type}`);
  }
};
