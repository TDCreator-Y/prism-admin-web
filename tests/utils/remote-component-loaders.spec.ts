import {
  loadComponent,
  loadUMDComponent,
  relocateUmdStyles,
} from '@/utils/remote-component-loaders';

vi.mock('@/config/remote-components', () => ({
  REMOTE_COMPONENT_LOAD_TIMEOUT_MS: 50,
  validateRemoteComponentResource: vi.fn((url: string) => new URL(url, 'https://example.com')),
}));

describe('remote-component-loaders', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    vi.restoreAllMocks();
    delete (window as any).VueComponent;
    delete (window as any).RemoteWidget;
  });

  it('relocates newly injected styles before the first app stylesheet', () => {
    const existingStyle = document.createElement('style');
    existingStyle.setAttribute('data-style', 'existing');
    document.head.appendChild(existingStyle);

    const appCss = document.createElement('link');
    appCss.rel = 'stylesheet';
    appCss.href = '/assets/app.css';
    document.head.appendChild(appCss);

    const newStyle = document.createElement('style');
    newStyle.setAttribute('data-style', 'remote');
    document.head.appendChild(newStyle);

    relocateUmdStyles(new Set([existingStyle]));

    expect(document.head.children[1]).toBe(newStyle);
    expect(document.head.children[2]).toBe(appCss);
  });

  it('reuses already loaded UMD scripts when the global export exists', async () => {
    const existingScript = document.createElement('script');
    existingScript.src = 'https://example.com/umd/existing.js';
    document.head.appendChild(existingScript);

    (window as any).RemoteWidget = { render: vi.fn() };

    await expect(
      loadUMDComponent('https://example.com/umd/existing.js', 'RemoteWidget')
    ).resolves.toBe((window as any).RemoteWidget);
  });

  it('loads UMD scripts with integrity and resolves after onload', async () => {
    const appendSpy = vi.spyOn(document.head, 'appendChild');
    appendSpy.mockImplementation(node => {
      const appendedNode = node as HTMLScriptElement;
      queueMicrotask(() => {
        (window as any).RemoteWidget = { mount: vi.fn() };
        appendedNode.onload?.(new Event('load'));
      });
      return node;
    });

    const component = await loadUMDComponent(
      '/umd/remote-widget.js',
      'RemoteWidget',
      'sha256-demo'
    );

    const script = appendSpy.mock.calls[0][0] as HTMLScriptElement;
    expect(script.src).toBe('https://example.com/umd/remote-widget.js');
    expect(script.crossOrigin).toBe('anonymous');
    expect(script.integrity).toBe('sha256-demo');
    expect(component).toBe((window as any).RemoteWidget);
  });

  it('throws for unsupported remote component types', async () => {
    await expect(
      loadComponent({
        name: 'Broken',
        type: 'unknown' as never,
        version: '1.0.0',
        path: '/broken.js',
      })
    ).rejects.toThrow('不支持的组件类型');
  });
});
