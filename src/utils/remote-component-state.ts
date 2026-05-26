import { ref } from 'vue';
import type { RemoteLibraryInfo } from './remote-component-types';

export const remoteLibraries = ref<RemoteLibraryInfo[]>([]);

let resolveUmdReadyInternal: () => void = () => {};

export const umdComponentsReady: Promise<void> = new Promise(resolve => {
  resolveUmdReadyInternal = resolve;
});

export function markUmdComponentsReady() {
  resolveUmdReadyInternal();
}
