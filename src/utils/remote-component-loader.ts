import type { App } from 'vue';
import * as Vue from 'vue';
import { REMOTE_COMPONENT_SKIP_LOAD_TOKEN } from '@/config/remote-components';
import { loadConfig } from './remote-component-config';
import { remoteComponentLogger } from './remote-component-logger';
import { registerComponent } from './remote-component-registrar';
import {
  markUmdComponentsReady,
  remoteLibraries,
  umdComponentsReady,
} from './remote-component-state';
import { generateUmdRoutes } from './remote-component-routes';
export type {
  RemoteLibraryInfo,
  ComponentConfig,
  Config,
} from './remote-component-types';
export { remoteLibraries, umdComponentsReady, generateUmdRoutes };

function updateRemoteComponentLoadStatus(status: RemoteComponentLoadStatus) {
  window.remoteComponentLoadStatus = status;
}

function reportRemoteComponentLoadFailure(configUrl: string, error: unknown) {
  const errorMessage = error instanceof Error ? error.message : String(error);

  updateRemoteComponentLoadStatus({
    status: 'error',
    configUrl,
    error: errorMessage,
    timestamp: Date.now(),
  });

  remoteComponentLogger.error(
    `Failed to register remote components from "${configUrl}":`,
    error
  );
  remoteComponentLogger.warn(
    'Remote component loading failed. The application will continue without remote libraries.'
  );
}

export const registerRemoteComponents = async (
  app: App,
  configUrl: string = '/codes/umdComponents.json'
) => {
  if (!window.Vue) {
    window.Vue = Vue;
  }

  if (configUrl === REMOTE_COMPONENT_SKIP_LOAD_TOKEN) {
    updateRemoteComponentLoadStatus({
      status: 'skipped',
      configUrl,
      timestamp: Date.now(),
    });
    markUmdComponentsReady();
    return;
  }

  try {
    const config = await loadConfig(configUrl);
    updateRemoteComponentLoadStatus({
      status: 'loading',
      configUrl,
      timestamp: Date.now(),
    });
    remoteComponentLogger.info('Config loaded:', config);

    if (!config.components || config.components.length === 0) {
      remoteComponentLogger.warn('No components found in config');
      return;
    }

    const loadResults: Array<{ name: string; success: boolean; error?: string }> = [];

    remoteLibraries.value = config.components.map(c => ({
      name: c.name,
      url: c.path,
      status: 'pending',
    }));

    const CONCURRENCY_LIMIT = 3;

    for (let i = 0; i < config.components.length; i += CONCURRENCY_LIMIT) {
      const chunk = config.components.slice(i, i + CONCURRENCY_LIMIT);

      const loadPromises = chunk.map(async componentConfig => {
        const libIndex = remoteLibraries.value.findIndex(l => l.name === componentConfig.name);
        if (libIndex !== -1) {
          remoteLibraries.value[libIndex].status = 'loading';
        }

        try {
          await registerComponent(app, componentConfig);
          loadResults.push({ name: componentConfig.name, success: true });

          if (libIndex !== -1 && remoteLibraries.value[libIndex].status !== 'success') {
            remoteLibraries.value[libIndex].status = 'success';
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          loadResults.push({
            name: componentConfig.name,
            success: false,
            error: errorMessage,
          });

          if (libIndex !== -1) {
            remoteLibraries.value[libIndex].status = 'error';
            remoteLibraries.value[libIndex].error = errorMessage;
          }
        }
      });

      await Promise.allSettled(loadPromises);
    }

    const successCount = loadResults.filter(r => r.success).length;
    const failureCount = loadResults.filter(r => !r.success).length;

    remoteComponentLogger.info(
      `Component loading completed: ${successCount} successful, ${failureCount} failed`
    );

    if (failureCount > 0) {
      remoteComponentLogger.warn(
        'Failed components:',
        loadResults.filter(r => !r.success)
      );
    }
    updateRemoteComponentLoadStatus({
      status: failureCount > 0 ? 'partial' : 'success',
      configUrl,
      successCount,
      failureCount,
      timestamp: Date.now(),
    });
  } catch (error) {
    reportRemoteComponentLoadFailure(configUrl, error);
  } finally {
    markUmdComponentsReady();
  }
};
