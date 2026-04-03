import type { FetchOptions, FetchResponse } from './types.js';

export function createFetch() {
  return async function fetch(url: string, options?: FetchOptions): Promise<FetchResponse> {
    const hostFetch = (globalThis as Record<string, unknown>).__fetch as
      | ((url: string, options?: FetchOptions) => Promise<FetchResponse>)
      | undefined;

    if (!hostFetch) {
      throw new Error('__fetch is not available. Ensure the host provides a fetch implementation.');
    }

    return hostFetch(url, options);
  };
}
