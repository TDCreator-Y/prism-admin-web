import type { Router } from 'vue-router';

const {
  beforeEachHandlers,
  afterEachHandlers,
  mockStart,
  mockDone,
  mockGetGlobalConfig,
  mockSetSelectedKey,
  mockAddTab,
  mockReadJsonStorage,
  mockWaitForRoutesReady,
  mockIsDynamicRoutesReady,
  mockSetTargetNavigation,
} = vi.hoisted(() => ({
  beforeEachHandlers: [] as Array<(to: any, from: any, next: (value?: any) => void) => unknown>,
  afterEachHandlers: [] as Array<(to: any, from: any) => unknown>,
  mockStart: vi.fn(),
  mockDone: vi.fn(),
  mockGetGlobalConfig: vi.fn(),
  mockSetSelectedKey: vi.fn(),
  mockAddTab: vi.fn(),
  mockReadJsonStorage: vi.fn(),
  mockWaitForRoutesReady: vi.fn(),
  mockIsDynamicRoutesReady: vi.fn(),
  mockSetTargetNavigation: vi.fn(),
}));

vi.mock('nprogress', () => ({
  default: {
    configure: vi.fn(),
    start: mockStart,
    done: mockDone,
  },
}));

vi.mock('nprogress/nprogress.css', () => ({}));

vi.mock('@/router/routes', () => ({
  getGlobalConfig: mockGetGlobalConfig,
}));

vi.mock('@/layouts/modules/global-menu/store', () => ({
  useMenuStore: () => ({
    setSelectedKey: mockSetSelectedKey,
    addTab: mockAddTab,
  }),
}));

vi.mock('@/utils/storage-keys', () => ({
  STORAGE_KEY_CANDIDATES: {
    theme: ['ui:theme'],
  },
  readJsonStorage: mockReadJsonStorage,
}));

vi.mock('@/router/index', () => ({
  waitForRoutesReady: mockWaitForRoutesReady,
  isDynamicRoutesReady: mockIsDynamicRoutesReady,
  setTargetNavigation: mockSetTargetNavigation,
}));

import { setupRouteGuards } from '@/router/guards';

function createRouterMock(): Router {
  return {
    beforeEach: vi.fn(handler => {
      beforeEachHandlers.push(handler);
    }),
    afterEach: vi.fn(handler => {
      afterEachHandlers.push(handler);
    }),
  } as unknown as Router;
}

describe('guards', () => {
  let next: ReturnType<typeof vi.fn>;
  const originalLocation = window.location;

  beforeEach(() => {
    beforeEachHandlers.length = 0;
    afterEachHandlers.length = 0;
    next = vi.fn();
    mockStart.mockClear();
    mockDone.mockClear();
    mockGetGlobalConfig.mockReset();
    mockSetSelectedKey.mockReset();
    mockAddTab.mockReset();
    mockReadJsonStorage.mockReset();
    mockWaitForRoutesReady.mockReset();
    mockIsDynamicRoutesReady.mockReset();
    mockSetTargetNavigation.mockReset();

    mockGetGlobalConfig.mockReturnValue({
      IsAuthenticated: true,
      PublicLoginUrl: '',
    });
    mockReadJsonStorage.mockReturnValue({});
    mockWaitForRoutesReady.mockResolvedValue(undefined);
    mockIsDynamicRoutesReady.mockReturnValue(true);

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        href: 'http://localhost:4173/#/dashboard',
        hash: '#/dashboard',
      },
    });
    document.title = '';
    document.documentElement.style.removeProperty('--nprogress-color');
  });

  afterAll(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });

  it('redirects unauthenticated users to the configured public login url', async () => {
    mockGetGlobalConfig.mockReturnValue({
      IsAuthenticated: false,
      PublicLoginUrl: 'https://sso.example.com/login?scope=dashboard',
    });

    setupRouteGuards(createRouterMock());

    await beforeEachHandlers[0](
      { path: '/dashboard', meta: {}, name: 'dashboard' },
      { path: '/' },
      next
    );

    expect(mockStart).toHaveBeenCalled();
    expect(window.location.href).toBe(
      `https://sso.example.com/login?scope=dashboard&redirect=${encodeURIComponent('http://localhost:4173/#/dashboard')}`
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('redirects unauthenticated users to the local login page when no public login is configured', async () => {
    mockGetGlobalConfig.mockReturnValue({
      IsAuthenticated: false,
      PublicLoginUrl: '',
    });

    setupRouteGuards(createRouterMock());

    await beforeEachHandlers[0](
      { path: '/dashboard', meta: {}, name: 'dashboard' },
      { path: '/' },
      next
    );

    expect(next).toHaveBeenCalledWith('/login');
    expect(mockSetSelectedKey).not.toHaveBeenCalled();
  });

  it('waits for dynamic routes on 404 fallback and restores hash navigation target', async () => {
    mockIsDynamicRoutesReady.mockReturnValue(false);
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        href: 'http://localhost:4173/#/reports/detail',
        hash: '#/reports/detail',
      },
    });

    setupRouteGuards(createRouterMock());

    await beforeEachHandlers[0](
      { path: '/404', meta: {}, name: 'page-not-found' },
      { path: '/' },
      next
    );

    expect(mockSetTargetNavigation).toHaveBeenCalledWith('/reports/detail');
    expect(mockWaitForRoutesReady).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith('/reports/detail');
  });

  it('updates page title, progress theme and menu tab state for authenticated navigation', async () => {
    mockReadJsonStorage.mockReturnValue({
      primaryColor: '#22c55e',
    });

    setupRouteGuards(createRouterMock());

    await beforeEachHandlers[0](
      {
        path: '/dashboard',
        name: 'dashboard',
        meta: {
          title: '仪表盘',
          icon: 'fa-chart-line',
        },
      },
      { path: '/home' },
      next
    );

    expect(document.documentElement.style.getPropertyValue('--nprogress-color')).toBe('#22c55e');
    expect(document.title).toBe('仪表盘');
    expect(mockSetSelectedKey).toHaveBeenCalledWith('/dashboard');
    expect(mockAddTab).toHaveBeenCalledWith({
      key: 'dashboard',
      path: '/dashboard',
      title: '仪表盘',
      icon: 'fa-chart-line',
    });
    expect(next).toHaveBeenCalledWith();

    afterEachHandlers[0]({ path: '/dashboard' }, { path: '/home' });
    expect(mockDone).toHaveBeenCalled();
  });
});
