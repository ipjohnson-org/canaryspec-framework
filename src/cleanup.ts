import type { CheckState } from './state.js';

export function createOnCleanup(state: CheckState) {
  return function onCleanup(descriptionOrFn: string | (() => void | Promise<void>), maybeFn?: () => void | Promise<void>) {
    if (typeof descriptionOrFn === 'function') {
      state.cleanups.push({ fn: descriptionOrFn });
    } else {
      state.cleanups.push({ description: descriptionOrFn, fn: maybeFn! });
    }
  };
}
