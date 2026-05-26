/**
 * 轻量级 fetch 包装器。
 *
 * 统一处理：credentials 注入、HTTP 错误分类、网络异常包装。
 * 调用方通过捕获 HttpError 并检查 .status 来决定业务行为（跳转登录、弹出提示等）。
 */

export class HttpError extends Error {
  readonly name = 'HttpError';

  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
  }

  get isUnauthorized() { return this.status === 401; }
  get isForbidden() { return this.status === 403; }
  get isServerError() { return this.status >= 500; }
  get isNetworkError() { return this.status === 0; }
}

async function parseBody<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) return undefined as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

async function request<T = unknown>(url: string, init: RequestInit = {}): Promise<T> {
  let res: Response;

  try {
    res = await fetch(url, {
      credentials: 'include',
      ...init,
    });
  } catch (err) {
    // 网络层错误：断网、CORS、DNS 解析失败等
    throw new HttpError(0, err instanceof Error ? err.message : '网络连接失败，请检查网络后重试');
  }

  if (res.ok) {
    return parseBody<T>(res);
  }

  const statusMessages: Record<number, string> = {
    400: '请求参数错误 (400)',
    401: '登录已过期，请重新登录 (401)',
    403: '您没有权限执行此操作 (403)',
    404: '请求的资源不存在 (404)',
    429: '请求过于频繁，请稍后重试 (429)',
    500: '服务器内部错误，请联系管理员 (500)',
    502: '网关错误，服务暂时不可用 (502)',
    503: '服务暂时不可用，请稍后重试 (503)',
  };

  const message = statusMessages[res.status] ?? `请求失败 (${res.status}: ${res.statusText})`;
  throw new HttpError(res.status, message);
}

export const http = {
  get<T = unknown>(url: string, init?: RequestInit): Promise<T> {
    return request<T>(url, { method: 'GET', ...init });
  },

  post<T = unknown>(url: string, body?: unknown, init?: RequestInit): Promise<T> {
    const isForm = body instanceof FormData;
    return request<T>(url, {
      method: 'POST',
      body: isForm ? body : JSON.stringify(body),
      headers: isForm ? undefined : { 'Content-Type': 'application/json' },
      ...init,
    });
  },

  put<T = unknown>(url: string, body?: unknown, init?: RequestInit): Promise<T> {
    return request<T>(url, {
      method: 'PUT',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
      ...init,
    });
  },

  delete<T = unknown>(url: string, init?: RequestInit): Promise<T> {
    return request<T>(url, { method: 'DELETE', ...init });
  },
};

// ── Refresh Token 锁（为接入真实 JWT 预留）──────────────────────────────────
// 当后端启用 Refresh Token 时，取消以下注释并实现 refreshAccessToken()。
//
// let refreshPromise: Promise<void> | null = null;
//
// async function withTokenRefresh<T>(fn: () => Promise<T>): Promise<T> {
//   try {
//     return await fn();
//   } catch (err) {
//     if (!(err instanceof HttpError && err.isUnauthorized)) throw err;
//     if (!refreshPromise) {
//       refreshPromise = refreshAccessToken().finally(() => { refreshPromise = null; });
//     }
//     await refreshPromise;  // 并发请求共享同一个刷新 Promise，避免重复刷新
//     return fn();           // 刷新成功后重试原始请求
//   }
// }
