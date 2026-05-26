import type { Router } from 'vue-router';
import type { MenuItem } from '@/layouts/modules/global-menu/types';

export interface OpenTabOptions {
  newTab?: boolean;
  activateExisting?: boolean;
}

export interface PathInfo {
  key: string;
  path: string;
  title?: string;
  icon?: string;
  routeId?: string;
  url?: string;
  type?: 'webview' | 'vue';
}

type MenuLikeItem = MenuItem & {
  DisplayName?: string;
  Title?: string;
  Icon?: string;
  RouteId?: string;
  url?: string;
  Url?: string;
  FunctionId?: string;
  functionId?: string;
  children?: MenuLikeItem[];
  meta?: Record<string, unknown>;
};

function getItemMeta(item: MenuLikeItem): Record<string, unknown> {
  return item.meta ?? {};
}

function getRouteId(item: MenuLikeItem): string | undefined {
  const meta = getItemMeta(item);
  return item.routeId || item.RouteId || (meta.routeId as string | undefined);
}

function getItemUrl(item: MenuLikeItem): string | undefined {
  const meta = getItemMeta(item);
  return (
    item.url ||
    item.Url ||
    item.functionId ||
    item.FunctionId ||
    (meta.url as string | undefined) ||
    (meta.functionId as string | undefined)
  );
}

function getItemTitle(item: MenuLikeItem): string | undefined {
  return item.title || item.DisplayName || item.Title;
}

function getItemIcon(item: MenuLikeItem): string | undefined {
  return item.icon || item.Icon;
}

export function isAppBridgeAvailable(): boolean {
  return typeof window !== 'undefined' && !!window.appBridge;
}

export function isExternalUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

export function openExternalUrl(url: string): boolean {
  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
}

export function normalizePath(path: string): string {
  let normalized = path;
  if (!normalized.startsWith('/')) {
    normalized = `/${normalized}`;
  }
  return normalized.split('?')[0].split('#')[0];
}

export function getPageType(item: MenuLikeItem): 'webview' | 'vue' {
  const url = getItemUrl(item) || '';
  return url.endsWith('.vue') ? 'vue' : 'webview';
}

export function toPathInfo(item: MenuLikeItem): PathInfo {
  return {
    key: item.key,
    path: item.path,
    title: getItemTitle(item),
    icon: getItemIcon(item),
    routeId: getRouteId(item),
    url: getItemUrl(item),
    type: getPageType(item),
  };
}

function findInMenu(
  items: MenuLikeItem[],
  matcher: (item: MenuLikeItem) => boolean
): PathInfo | null {
  for (const item of items) {
    if (matcher(item)) {
      return toPathInfo(item);
    }
    if (item.children?.length) {
      const found = findInMenu(item.children as MenuLikeItem[], matcher);
      if (found) return found;
    }
  }
  return null;
}

export function findPathInfo(menuList: MenuLikeItem[], path: string): PathInfo | null {
  return findInMenu(menuList, item => item.path === path);
}

export function findPathInfoByRouteId(menuList: MenuLikeItem[], routeId: string): PathInfo | null {
  return findInMenu(menuList, item => {
    const currentRouteId = getRouteId(item);
    return currentRouteId === routeId || item.key === routeId;
  });
}

export function buildTabFromPathInfo(pathInfo: PathInfo): MenuItem {
  const tab: MenuItem = {
    key: pathInfo.key,
    path: pathInfo.path,
    title: pathInfo.title || '未命名页面',
    icon: pathInfo.icon || 'fa-file',
    children: [],
  };

  if (pathInfo.routeId || pathInfo.url || pathInfo.type) {
    tab.meta = {
      routeId: pathInfo.routeId,
      url: pathInfo.url,
      type: pathInfo.type,
    };
  }

  return tab;
}

export async function openInternalPath(params: {
  router: Router;
  menuList: MenuLikeItem[];
  addTab: (tab: MenuItem) => void;
  path: string;
}): Promise<boolean> {
  const { router, menuList, addTab, path } = params;

  if (!path) {
    return false;
  }

  const normalizedPath = normalizePath(path);
  const pathInfo = findPathInfo(menuList, normalizedPath);

  if (pathInfo) {
    addTab(buildTabFromPathInfo(pathInfo));
  }

  await router.push(normalizedPath);
  return true;
}
