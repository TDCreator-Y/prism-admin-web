import type { ElegantRoute } from '@/router/routes/types';
import { remoteLibraries } from './remote-component-state';
import type { RemoteComponentDetail } from './remote-component-types';

function toRouteSafeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9]/g, '_');
}

export function generateUmdRoutes(): ElegantRoute[] {
  const routes: ElegantRoute[] = [];

  for (const lib of remoteLibraries.value) {
    if (lib.status !== 'success') continue;

    const EXCLUDED_KEYS = new Set([
      'default',
      'install',
      'manifest',
      'componentsMap',
      'componentsDetailed',
      'version',
      '__esModule',
      'VueDemoComponent',
    ]);
    const keys = (lib.componentKeys ?? []).filter(k => !EXCLUDED_KEYS.has(k));
    if (keys.length === 0) continue;

    const safeName = toRouteSafeName(lib.name);
    const libPath = `/umd/${lib.name}`;
    const libRouteName = `umd_${safeName}`;

    const children: ElegantRoute[] = keys.map(compName => {
      const detail = lib.componentsDetailed?.find(
        (d: RemoteComponentDetail) => d.name === compName || d.tag === compName
      );
      const title: string = detail?.zhName ?? detail?.displayName ?? detail?.title ?? compName;
      const rawIcon: string | undefined = detail?.icon;
      const icon: string | undefined = rawIcon?.replace(/^(fas|far|fab|fal|fad)\s+/, '');
      const description: string | undefined = detail?.description;

      return {
        name: `${libRouteName}_${toRouteSafeName(compName)}`,
        path: `${libPath}/${compName}`,
        component: 'view.umd-component',
        props: { componentName: compName },
        meta: {
          title,
          ...(icon ? { icon } : {}),
          ...(description ? { description } : {}),
          keepAlive: true,
          umdLibrary: lib.name,
          umdComponent: compName,
        },
      };
    });

    routes.push({
      name: libRouteName,
      path: libPath,
      component: 'layout.base',
      redirect: children[0]?.path,
      meta: {
        title: lib.manifest?.zhName ?? lib.name,
        icon: 'fa-cube',
        umdLibrary: lib.name,
      },
      children,
    });
  }

  return routes;
}
