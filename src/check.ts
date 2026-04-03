import { AssertError } from './errors.js';
import { createState, runCleanups } from './state.js';
import { createExpect } from './expect.js';
import { createAssert } from './assert.js';
import { createStep } from './step.js';
import { createTime } from './time.js';
import { createRetry } from './retry.js';
import { createGen } from './gen.js';
import { createOnCleanup } from './cleanup.js';
import { createMetric, createAnnotate, createDegrade } from './observability.js';
import { createEnv } from './env.js';
import { createFetch } from './fetch.js';
import { createPage } from './page.js';
import { createExtendedCheck } from './fixtures.js';
import type { CanaryContext, CheckOptions, CheckResult, FixtureDefinitions } from './types.js';

type CheckBody = (ctx: CanaryContext) => Promise<void>;

interface CheckEntry {
  name: string;
  options: CheckOptions | null;
  body: CheckBody;
}

export function createCheckRunner() {
  const registry: CheckEntry[] = [];

  function register(name: string, options: CheckOptions | null, body: CheckBody) {
    registry.push({ name, options, body });
  }

  function check(
    name: string,
    optionsOrFn: CheckOptions | CheckBody,
    maybeFn?: CheckBody,
  ) {
    if (typeof optionsOrFn === 'function') {
      register(name, null, optionsOrFn);
    } else {
      register(name, optionsOrFn, maybeFn!);
    }
  }

  check.extend = function (fixtures: FixtureDefinitions) {
    return createExtendedCheck(fixtures, register);
  };

  function getRegistrations() {
    return registry.map(e => ({
      name: e.name,
      options: e.options ?? undefined,
    }));
  }

  async function runCheck(name: string): Promise<CheckResult> {
    const entry = registry.find(e => e.name === name);
    if (!entry) {
      return {
        name,
        status: 'errored',
        durationMs: 0,
        steps: [],
        cleanups: [],
        timings: {},
        metrics: {},
        annotations: {},
        degradedReasons: [],
        errorMessage: `Check '${name}' not found`,
      };
    }

    const state = createState();
    const gen = createGen();

    // Only create page if the browser shim is available
    const hasPage = '__page' in globalThis;

    const ctx: CanaryContext = {
      fetch: createFetch(),
      expect: createExpect(),
      assert: createAssert(),
      env: createEnv(),
      step: createStep(state),
      onCleanup: createOnCleanup(state),
      time: createTime(state),
      retry: createRetry(),
      metric: createMetric(state),
      annotate: createAnnotate(state),
      degrade: createDegrade(state),
      gen,
      ...(hasPage ? { page: createPage(gen) } : {}),
    };

    // Set all context functions as globals so checks can use them without destructuring
    const g = globalThis as Record<string, unknown>;
    for (const [key, value] of Object.entries(ctx)) {
      g[key] = value;
    }

    const start = Date.now();

    try {
      await entry.body(ctx);
      const cleanupResults = await runCleanups(state);

      const status = state.degradedReasons.length > 0 ? 'degraded' : 'passed';
      return {
        name,
        status,
        durationMs: Date.now() - start,
        steps: state.steps,
        cleanups: cleanupResults,
        timings: state.timings,
        metrics: state.metrics,
        annotations: state.annotations,
        degradedReasons: state.degradedReasons,
      };
    } catch (e: unknown) {
      const cleanupResults = await runCleanups(state);
      const isAssert = e instanceof AssertError;
      const err = e instanceof Error ? e : new Error(String(e));

      return {
        name,
        status: isAssert ? 'failed' : 'errored',
        durationMs: Date.now() - start,
        steps: state.steps,
        cleanups: cleanupResults,
        timings: state.timings,
        metrics: state.metrics,
        annotations: state.annotations,
        degradedReasons: state.degradedReasons,
        errorMessage: err.message,
        errorStack: isAssert ? undefined : err.stack,
      };
    }
  }

  return { check, getRegistrations, runCheck };
}
