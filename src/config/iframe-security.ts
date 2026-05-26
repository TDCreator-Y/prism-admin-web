export type IframeReferrerPolicy =
  | 'no-referrer'
  | 'no-referrer-when-downgrade'
  | 'origin'
  | 'origin-when-cross-origin'
  | 'same-origin'
  | 'strict-origin'
  | 'strict-origin-when-cross-origin'
  | 'unsafe-url';

export const IFRAME_REFERRER_POLICY: IframeReferrerPolicy = 'strict-origin-when-cross-origin';

export interface IframeSecurityPolicy {
  name: 'same-origin' | 'cross-origin';
  sandbox: string;
  allow: string;
  referrerPolicy: IframeReferrerPolicy;
}

const COMMON_IFRAME_SANDBOX_TOKENS = [
  'allow-downloads',
  'allow-forms',
  'allow-modals',
  'allow-popups',
  'allow-scripts',
];

const SAME_ORIGIN_IFRAME_SANDBOX_TOKENS = [
  ...COMMON_IFRAME_SANDBOX_TOKENS,
  // 同源业务页可能依赖 Cookie、Storage、同源 XHR 和用户触发后的父级跳转。
  'allow-same-origin',
  'allow-top-navigation-by-user-activation',
];

const CROSS_ORIGIN_IFRAME_SANDBOX_TOKENS = [
  ...COMMON_IFRAME_SANDBOX_TOKENS,
  // 对外链 iframe 移除 same-origin、顶层跳转和 popup 脱沙箱能力，避免越权逃逸。
];

const SAME_ORIGIN_IFRAME_ALLOW_FEATURES = ['fullscreen', 'clipboard-read', 'clipboard-write'];
const CROSS_ORIGIN_IFRAME_ALLOW_FEATURES = ['fullscreen'];

function serializeFeatureList(features: string[]): string {
  return features.join('; ');
}

function serializeSandboxTokens(tokens: string[]): string {
  return tokens.join(' ');
}

const SAME_ORIGIN_IFRAME_POLICY: IframeSecurityPolicy = {
  name: 'same-origin',
  sandbox: serializeSandboxTokens(SAME_ORIGIN_IFRAME_SANDBOX_TOKENS),
  allow: serializeFeatureList(SAME_ORIGIN_IFRAME_ALLOW_FEATURES),
  referrerPolicy: IFRAME_REFERRER_POLICY,
};

const CROSS_ORIGIN_IFRAME_POLICY: IframeSecurityPolicy = {
  name: 'cross-origin',
  sandbox: serializeSandboxTokens(CROSS_ORIGIN_IFRAME_SANDBOX_TOKENS),
  allow: serializeFeatureList(CROSS_ORIGIN_IFRAME_ALLOW_FEATURES),
  referrerPolicy: IFRAME_REFERRER_POLICY,
};

function parseAllowedOrigins(rawValue?: string): string[] {
  return (rawValue || '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
}

export function getIframeAllowedOrigins(): string[] {
  return Array.from(new Set(parseAllowedOrigins(import.meta.env.VITE_IFRAME_ALLOWED_ORIGINS)));
}

export function resolveIframeUrl(resourcePath: string): URL {
  if (typeof window === 'undefined') {
    throw new Error('Iframe URL resolution requires a browser environment.');
  }

  return new URL(resourcePath, window.location.origin);
}

export function validateIframeUrl(resourcePath: string): URL {
  const resourceUrl = resolveIframeUrl(resourcePath);
  const isSameOrigin = resourceUrl.origin === window.location.origin;

  if (isSameOrigin) {
    return resourceUrl;
  }

  if (resourceUrl.protocol !== 'https:') {
    throw new Error(`Iframe external URL must use HTTPS: ${resourceUrl.toString()}`);
  }

  const allowedOrigins = getIframeAllowedOrigins();
  if (!allowedOrigins.includes(resourceUrl.origin)) {
    throw new Error(
      `Iframe origin is not allowlisted: ${resourceUrl.origin}. Configure VITE_IFRAME_ALLOWED_ORIGINS to allow it.`
    );
  }

  return resourceUrl;
}

export function getIframeSecurityPolicy(resourcePath: string): IframeSecurityPolicy {
  const resourceUrl = validateIframeUrl(resourcePath);
  const isSameOrigin = resourceUrl.origin === window.location.origin;
  return isSameOrigin ? SAME_ORIGIN_IFRAME_POLICY : CROSS_ORIGIN_IFRAME_POLICY;
}
