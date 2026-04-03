import type { CheckState } from './state.js';

export function createStep(state: CheckState) {
  return async function step<T = void>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = Date.now();
    try {
      const result = await fn();
      state.steps.push({ name, durationMs: Date.now() - start, passed: true });
      return result;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      state.steps.push({ name, durationMs: Date.now() - start, passed: false, errorMessage: msg });
      throw e;
    }
  };
}
