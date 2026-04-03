import { createCheckRunner } from './check.js';
import type { Framework } from './types.js';

export type { Framework } from './types.js';
export { AssertError } from './errors.js';
export { createCheckRunner } from './check.js';

/**
 * Create an isolated framework instance. Each call returns independent state.
 * Use this in tests for full isolation between test cases.
 */
export function createFramework(): Framework {
  const runner = createCheckRunner();
  return {
    check: runner.check,
    getRegistrations: runner.getRegistrations,
    runCheck: runner.runCheck,
  };
}

/**
 * Install framework globals on globalThis.
 * Used by V8 host (IIFE bundle) and Node bootstrap.
 */
export function install(): void {
  const runner = createCheckRunner();
  const g = globalThis as Record<string, unknown>;

  g.check = runner.check;

  // Host-facing APIs
  g.__getRegistrations = runner.getRegistrations;
  g.__runCheck = runner.runCheck;
}
