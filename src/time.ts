import { parseDuration } from './helpers.js';
import type { CheckState } from './state.js';
import type { TimeOptions, TimedResult } from './types.js';

export function createTime(state: CheckState) {
  return async function time<T>(
    labelOrFn: string | (() => Promise<T>),
    optionsOrFn?: TimeOptions | (() => Promise<T>),
    maybeFn?: () => Promise<T>,
  ): Promise<TimedResult<T>> {
    let label: string | null;
    let options: TimeOptions | null;
    let fn: () => Promise<T>;

    if (typeof labelOrFn === 'function') {
      label = null;
      options = null;
      fn = labelOrFn;
    } else if (typeof optionsOrFn === 'function') {
      label = labelOrFn;
      options = null;
      fn = optionsOrFn;
    } else {
      label = labelOrFn;
      options = optionsOrFn ?? null;
      fn = maybeFn!;
    }

    const start = Date.now();
    const result = await fn();
    const duration = Date.now() - start;

    const warn = options?.warn ?? null;
    const fail = options?.fail ?? null;

    if (label !== null) {
      const warnBreached = warn !== null && duration >= parseDuration(warn);
      const failBreached = fail !== null && duration >= parseDuration(fail);

      state.timings[label] = {
        durationMs: duration,
        warn: warn ?? undefined,
        fail: fail ?? undefined,
        warnBreached,
        failBreached,
      };
    }

    if (fail !== null && duration >= parseDuration(fail)) {
      throw new Error(`${label}: ${Math.round(duration)}ms exceeded fail threshold of ${fail}`);
    }

    return { result, duration };
  };
}
