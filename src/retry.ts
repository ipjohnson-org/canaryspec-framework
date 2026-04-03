import { parseDuration } from './helpers.js';
import type { RetryOptions } from './types.js';

export function createRetry() {
  return async function retry<T>(options: RetryOptions<T>, fn: () => Promise<T>): Promise<T> {
    const { attempts, backoff = 'fixed', jitter = false, until } = options;
    const baseMs = options.delay ? parseDuration(options.delay) : 1000;

    let lastError: unknown;
    let lastResult: T | undefined;

    for (let attempt = 0; attempt < attempts; attempt++) {
      try {
        const result = await fn();

        if (until && !until(result)) {
          lastResult = result;
          if (attempt < attempts - 1) {
            await delay(computeDelay(baseMs, attempt, backoff, jitter));
            continue;
          }
          return result;
        }

        return result;
      } catch (e) {
        lastError = e;
        if (attempt < attempts - 1) {
          await delay(computeDelay(baseMs, attempt, backoff, jitter));
        }
      }
    }

    if (lastError) throw lastError;
    return lastResult as T;
  };
}

function computeDelay(baseMs: number, attempt: number, backoff: string, jitter: boolean): number {
  let ms: number;
  switch (backoff) {
    case 'linear':
      ms = baseMs * (attempt + 1);
      break;
    case 'exponential':
      ms = baseMs * Math.pow(2, attempt);
      break;
    default: // fixed
      ms = baseMs;
  }
  if (jitter) {
    ms = Math.random() * ms;
  }
  return ms;
}

function delay(ms: number): Promise<void> {
  const hostDelay = (globalThis as Record<string, unknown>).__delay as
    | ((ms: number) => Promise<void>)
    | undefined;
  if (hostDelay) return hostDelay(ms);
  // Fallback: no delay if host doesn't provide __delay
  return Promise.resolve();
}
