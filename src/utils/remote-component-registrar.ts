import type { App, Component, Plugin } from 'vue';
import type { ComponentConfig, RemoteComponentModule } from './remote-component-types';
import { remoteLibraries } from './remote-component-state';
import { loadComponent } from './remote-component-loaders';
import { remoteComponentLogger } from './remote-component-logger';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toRemoteComponentModule(value: unknown): RemoteComponentModule | null {
  return isRecord(value) ? (value as RemoteComponentModule) : null;
}

function hasInstallHook(value: unknown): value is Plugin {
  return isRecord(value) && typeof value.install === 'function';
}

function isVueComponentCandidate(value: unknown): value is Component {
  return typeof value === 'function' || isRecord(value);
}

export const registerComponent = async (app: App, componentConfig: ComponentConfig) => {
  try {
    remoteComponentLogger.info(
      `Loading component: ${componentConfig.name} (${componentConfig.type}) from ${componentConfig.path}`
    );

    const remoteComponent = await loadComponent(componentConfig);
    const remoteModule = toRemoteComponentModule(remoteComponent);

    const libIndex = remoteLibraries.value.findIndex(l => l.name === componentConfig.name);
    if (libIndex !== -1) {
      const lib = remoteLibraries.value[libIndex];
      lib.status = 'success';

      if (remoteModule) {
        lib.componentKeys = Object.keys(remoteModule);
        if (remoteModule.manifest) {
          lib.manifest = remoteModule.manifest;
          if (!remoteModule.componentsDetailed && remoteModule.manifest.componentsDetailed) {
            lib.componentsDetailed = remoteModule.manifest.componentsDetailed;
          }
          if (!remoteModule.componentsMap && remoteModule.manifest.componentsMap) {
            lib.componentsMap = remoteModule.manifest.componentsMap;
          }
        }

        if (remoteModule.componentsMap) lib.componentsMap = remoteModule.componentsMap;
        if (remoteModule.componentsDetailed) {
          lib.componentsDetailed = remoteModule.componentsDetailed;
        }

        if (componentConfig.metadata) {
          if (componentConfig.metadata.zhName) {
            if (!lib.manifest) lib.manifest = {};
            lib.manifest.zhName = componentConfig.metadata.zhName;
          }
          if (componentConfig.metadata.componentsDetailed) {
            lib.componentsDetailed = componentConfig.metadata.componentsDetailed;
          }
        }
      }
    }

    remoteComponentLogger.group(`[Remote Component Loaded]: ${componentConfig.name}`);
    try {
      if (remoteModule) {
        remoteComponentLogger.info('Component Keys:', Object.keys(remoteModule));

        if (remoteModule.manifest) {
          remoteComponentLogger.info('Manifest:', remoteModule.manifest);
        }
        if (remoteModule.componentsMap) {
          remoteComponentLogger.info('Components Map:', remoteModule.componentsMap);
        }
        if (remoteModule.componentsDetailed) {
          remoteComponentLogger.info('Components Detailed:', remoteModule.componentsDetailed);
        }
      } else {
        remoteComponentLogger.info('Component Content (primitive):', remoteComponent);
      }
    } catch (e) {
      remoteComponentLogger.warn('Could not inspect component content:', e);
    }
    remoteComponentLogger.groupEnd();

    if (componentConfig.autoRegister) {
      if (remoteModule) {
        if (hasInstallHook(remoteModule)) {
          app.use(remoteModule);
          remoteComponentLogger.info(
            `Library plugin ${componentConfig.name} installed (via autoRegister)`
          );
          return;
        }

        const cssInjectors = [
          'injectStyles',
          '__inject_styles',
          'injectCss',
          '_injectStyles',
          'applyStyles',
          'install_styles',
        ];
        for (const cssKey of cssInjectors) {
          if (typeof remoteModule[cssKey] === 'function') {
            try {
              (remoteModule[cssKey] as () => void)();
            } catch (_) {
              /* ignore */
            }
          }
        }

        for (const key in remoteModule) {
          const item = remoteModule[key];
          if (isRecord(item) && !Array.isArray(item)) {
            for (const cssKey of cssInjectors) {
              if (typeof item[cssKey] === 'function') {
                try {
                  (item[cssKey] as () => void)();
                } catch (_) {
                  /* ignore */
                }
              }
            }
          }
        }

        let registeredCount = 0;
        for (const key in remoteModule) {
          const component = remoteModule[key];
          if (isVueComponentCandidate(component)) {
            app.component(key, component);
            remoteComponentLogger.info(`Auto-registered component: ${key}`);
            registeredCount++;
          }
        }

        if (registeredCount === 0) {
          remoteComponentLogger.warn(
            `No components found to auto-register in ${componentConfig.name}`
          );
        } else {
          remoteComponentLogger.info(
            `Successfully auto-registered ${registeredCount} components from ${componentConfig.name}`
          );
          if (libIndex !== -1) {
            remoteLibraries.value[libIndex].registeredCount = registeredCount;
          }
        }
        return;
      }
    }

    if (hasInstallHook(remoteComponent)) {
      app.use(remoteComponent);
      remoteComponentLogger.info(`Component plugin ${componentConfig.name} registered successfully`);
    } else if (remoteModule) {
      const namedExport = remoteModule[componentConfig.name];
      if (isVueComponentCandidate(namedExport)) {
        app.component(componentConfig.name, namedExport);
        remoteComponentLogger.info(`Component ${componentConfig.name} registered successfully`);
        return;
      }
    }

    if (isVueComponentCandidate(remoteComponent)) {
      app.component(componentConfig.name, remoteComponent);
      remoteComponentLogger.info(`Component ${componentConfig.name} registered as direct component`);
    } else {
      throw new Error(`远程组件 ${componentConfig.name} 导出不是可注册的 Vue 组件或插件`);
    }
  } catch (error) {
    remoteComponentLogger.error(`Failed to load component ${componentConfig.name}:`, error);
    throw error;
  }
};
