import type { FetchOptions, FetchResponse } from './types.js';

export function createFetch() {
  return async function fetch(url: string, options?: FetchOptions): Promise<FetchResponse> {
    const hostFetch = (globalThis as Record<string, unknown>).__fetch as
      | ((url: string, options?: Record<string, unknown>) => Promise<Record<string, unknown>>)
      | undefined;

    if (!hostFetch) {
      throw new Error('__fetch is not available. Ensure the host provides a fetch implementation.');
    }

    // Normalize options before passing to host — serialize body to string in JS
    // so the C# host doesn't need to handle ClearScript ScriptObject serialization
    const hostOptions: Record<string, unknown> | undefined = options ? {
      method: options.method,
      headers: options.headers,
      body: options.body !== undefined
        ? (typeof options.body === 'string' ? options.body : JSON.stringify(options.body))
        : undefined,
      timeout: options.timeout,
    } : undefined;

    const raw = await hostFetch(url, hostOptions);

    // Read body from host response
    const body = (raw._body ?? '') as string;

    // Parse headers from JSON string — C# Dictionaries don't expose keys
    // to JS Object.keys(), so the host serializes headers as JSON
    const headersJson = (raw._headersJson ?? '{}') as string;
    const headers: Record<string, string> = JSON.parse(headersJson);

    return {
      status: raw.status as number,
      statusText: (raw.statusText ?? '') as string,
      headers,
      ok: raw.ok as boolean,
      async json() { return JSON.parse(body); },
      async text() { return body; },
      async arrayBuffer() {
        if (typeof (raw as any).arrayBuffer === 'function') {
          return (raw as any).arrayBuffer();
        }
        throw new Error('arrayBuffer() not supported in this environment');
      },
    };
  };
}
