import { fetchMenuData, UnauthorizedError } from '@/router/routes/menu-service';

describe('menu-service', () => {
  it('returns the built-in mock menu contract', async () => {
    const data = await fetchMenuData('mock-internal-code');

    expect(data.MenuRoot).toMatchObject({
      routeId: 'root-mock',
      Title: 'Dashboard LightWeight',
    });
    expect(data.MenusMain.Total).toBe(2);
    expect(data.MenusMain.Results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          routeId: 'mock-demo',
          Type: 'Folder',
        }),
        expect.objectContaining({
          routeId: 'mock-demo-iframe',
          ParentRouteId: 'mock-demo',
          FunctionId: 'func-demo-iframe',
        }),
      ])
    );
  });

  it('exposes UnauthorizedError with stable 401 semantics', () => {
    const error = new UnauthorizedError();

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('UnauthorizedError');
    expect(error.message).toBe('权限不足，请重新登录');
    expect(error.status).toBe(401);
  });
});
