import type { ComponentConfig } from '@/utils/remote-component-types';

const { mockLoadComponent, mockLogger, remoteLibraries } = vi.hoisted(() => ({
  mockLoadComponent: vi.fn(),
  mockLogger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    group: vi.fn(),
    groupEnd: vi.fn(),
  },
  remoteLibraries: { value: [] as any[] },
}));

vi.mock('@/utils/remote-component-loaders', () => ({
  loadComponent: mockLoadComponent,
}));

vi.mock('@/utils/remote-component-logger', () => ({
  remoteComponentLogger: mockLogger,
}));

vi.mock('@/utils/remote-component-state', () => ({
  remoteLibraries,
}));

import { registerComponent } from '@/utils/remote-component-registrar';

describe('remote-component-registrar', () => {
  const app = {
    use: vi.fn(),
    component: vi.fn(),
  };

  const baseConfig: ComponentConfig = {
    name: 'RemoteWidgetLib',
    type: 'umd',
    version: '1.0.0',
    path: '/umd/remote-widget.js',
    autoRegister: true,
  };

  beforeEach(() => {
    remoteLibraries.value = [
      {
        name: 'RemoteWidgetLib',
        url: '/umd/remote-widget.js',
        status: 'loading',
      },
    ];
    mockLoadComponent.mockReset();
    mockLogger.info.mockReset();
    mockLogger.warn.mockReset();
    mockLogger.error.mockReset();
    mockLogger.group.mockReset();
    mockLogger.groupEnd.mockReset();
    app.use.mockReset();
    app.component.mockReset();
  });

  it('installs plugin-style remote modules when autoRegister is enabled', async () => {
    const pluginModule = {
      install: vi.fn(),
    };
    mockLoadComponent.mockResolvedValue(pluginModule);

    await registerComponent(app as never, baseConfig);

    expect(app.use).toHaveBeenCalledWith(pluginModule);
    expect(app.component).not.toHaveBeenCalled();
    expect(remoteLibraries.value[0].status).toBe('success');
  });

  it('auto-registers module exports and merges manifest metadata into the tracked library', async () => {
    const injectStyles = vi.fn();
    const widgetInjectStyles = vi.fn();
    const remoteModule = {
      injectStyles,
      WidgetA: {
        render: () => null,
        injectCss: widgetInjectStyles,
      },
      WidgetB: {
        setup: () => ({}),
      },
      manifest: {
        zhName: '旧中文名',
      },
      componentsDetailed: [
        {
          name: 'WidgetA',
          title: '旧标题',
        },
      ],
    };
    mockLoadComponent.mockResolvedValue(remoteModule);

    await registerComponent(app as never, {
      ...baseConfig,
      metadata: {
        zhName: '新的中文名',
        componentsDetailed: [
          {
            name: 'WidgetA',
            title: '覆盖后的标题',
          },
        ],
      },
    });

    expect(injectStyles).toHaveBeenCalled();
    expect(widgetInjectStyles).toHaveBeenCalled();
    expect(app.component).toHaveBeenCalledWith('WidgetA', remoteModule.WidgetA);
    expect(app.component).toHaveBeenCalledWith('WidgetB', remoteModule.WidgetB);
    expect(remoteLibraries.value[0]).toMatchObject({
      status: 'success',
      manifest: {
        zhName: '新的中文名',
      },
      componentsDetailed: [
        {
          name: 'WidgetA',
          title: '覆盖后的标题',
        },
      ],
      componentKeys: expect.arrayContaining(['WidgetA', 'WidgetB']),
    });
    expect(remoteLibraries.value[0].registeredCount).toBeGreaterThan(0);
  });

  it('registers direct component exports when remote module is a component candidate', async () => {
    const component = {
      render: () => null,
    };
    mockLoadComponent.mockResolvedValue(component);

    await registerComponent(app as never, {
      ...baseConfig,
      autoRegister: false,
      name: 'StandaloneWidget',
    });

    expect(app.component).toHaveBeenCalledWith('StandaloneWidget', component);
    expect(app.use).not.toHaveBeenCalled();
  });

  it('logs and rethrows when the remote export cannot be registered', async () => {
    const error = new Error('远程组件 BrokenWidget 导出不是可注册的 Vue 组件或插件');
    mockLoadComponent.mockResolvedValue('not-a-component');

    await expect(
      registerComponent(app as never, {
        ...baseConfig,
        autoRegister: false,
        name: 'BrokenWidget',
      })
    ).rejects.toThrow(error.message);

    expect(mockLogger.error).toHaveBeenCalled();
    expect(app.use).not.toHaveBeenCalled();
    expect(app.component).not.toHaveBeenCalled();
  });
});
