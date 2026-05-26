// 远程组件配置入口统一收口在此处，避免启动链路和说明文案散落硬编码。
export const REMOTE_COMPONENT_CONFIG_ENDPOINT =
  import.meta.env.VITE_REMOTE_COMPONENT_CONFIG_ENDPOINT || '/api/storages/files/query.json?folderPath=/Umd/File';

// 登录页未登录时使用该标记跳过远程组件加载，但仍需正常触发 ready 状态。
export const REMOTE_COMPONENT_SKIP_LOAD_TOKEN = '__REMOTE_COMPONENT_SKIP_LOAD__';

export const REMOTE_COMPONENT_LOAD_TIMEOUT_MS = Math.max(
  Number(import.meta.env.VITE_REMOTE_COMPONENT_LOAD_TIMEOUT_MS || '15000'),
  1000
);

function parseAllowedOrigins(rawValue?: string): string[] {
  return (rawValue || '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
}

export function getRemoteComponentAllowedOrigins(): string[] {
  return Array.from(new Set(parseAllowedOrigins(import.meta.env.VITE_REMOTE_COMPONENT_ALLOWED_ORIGINS)));
}

export function resolveRemoteComponentUrl(resourcePath: string): URL {
  if (typeof window === 'undefined') {
    throw new Error('Remote component URL resolution requires a browser environment.');
  }

  return new URL(resourcePath, window.location.origin);
}

export function validateRemoteComponentResource(
  resourcePath: string,
  options: {
    type: 'umd' | 'esm';
    integrity?: string;
  }
): URL {
  const resourceUrl = resolveRemoteComponentUrl(resourcePath);
  const isSameOrigin = resourceUrl.origin === window.location.origin;

  if (isSameOrigin) {
    return resourceUrl;
  }

  if (resourceUrl.protocol !== 'https:') {
    throw new Error(`Remote component must use HTTPS: ${resourceUrl.toString()}`);
  }

  const allowedOrigins = getRemoteComponentAllowedOrigins();
  if (!allowedOrigins.includes(resourceUrl.origin)) {
    throw new Error(
      `Remote component origin is not allowlisted: ${resourceUrl.origin}. Configure VITE_REMOTE_COMPONENT_ALLOWED_ORIGINS to allow it.`
    );
  }

  if (options.type === 'umd' && !options.integrity) {
    throw new Error(
      `Cross-origin UMD resource requires integrity: ${resourceUrl.toString()}`
    );
  }

  if (options.type === 'esm') {
    throw new Error(
      `Cross-origin ESM resource is not allowed because integrity cannot be enforced safely: ${resourceUrl.toString()}`
    );
  }

  return resourceUrl;
}
