import type { MenuApiResponse } from './types';

// [MOCK MODE] 直接返回本地 Mock 菜单数据，无需后端请求。
// 恢复后端连接时：使用 bridgeClient.request.get<MenuApiResponse>(`/api/menus/show.json?rootInternalCode=${_internalCode}`)
// 并在 status 401 时抛出 UnauthorizedError。

// 401 未授权错误（供上层识别并跳转登录页）
export class UnauthorizedError extends Error {
  readonly status = 401;
  constructor() {
    super('权限不足，请重新登录');
    this.name = 'UnauthorizedError';
  }
}

// ==================== Mock 菜单数据 ====================
// 这是一份本地演示菜单，用于开箱即用体验。
// 接入真实后端后，删除此 mock 数据，恢复 fetchMenuData 中的接口请求。
const MOCK_MENU_DATA: MenuApiResponse = {
  MenuRoot: {
    routeId: 'root-mock',
    Title: 'Dashboard LightWeight',
    DisplayName: 'Dashboard LightWeight',
  },
  MenusMain: {
    Total: 2,
    Results: [
      // ── 功能演示（保留一个 iframe 嵌入示例） ──
      {
        routeId: 'mock-demo',
        Title: '功能演示',
        Type: 'Folder',
        Icon: 'fas fa-flask',
        Order: 1,
      },
      {
        routeId: 'mock-demo-iframe',
        ParentRouteId: 'mock-demo',
        Title: 'iframe 嵌入示例',
        Type: 'Page',
        Icon: 'fas fa-window-restore',
        Order: 1,
        FunctionId: 'func-demo-iframe',
      },
    ],
  },
};

// 从接口获取菜单数据
export async function fetchMenuData(_internalCode: string): Promise<MenuApiResponse> {
  return MOCK_MENU_DATA;
}
