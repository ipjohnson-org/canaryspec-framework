import { install } from '../src/index.js';

const g = globalThis as Record<string, unknown>;

// Provide __fetch using Node's native fetch
g.__fetch = async (url: string, options?: Record<string, unknown>) => {
  const res = await fetch(url, {
    method: (options?.method as string) ?? 'GET',
    headers: options?.headers as Record<string, string>,
    body: options?.body
      ? typeof options.body === 'string'
        ? options.body
        : JSON.stringify(options.body)
      : undefined,
  });

  const body = await res.text();
  return {
    status: res.status,
    statusText: res.statusText,
    headers: Object.fromEntries(res.headers.entries()),
    ok: res.ok,
    json: async () => JSON.parse(body),
    text: async () => body,
    arrayBuffer: async () => new TextEncoder().encode(body).buffer,
  };
};

// Provide __env_get using process.env
g.__env_get = (name: string) => process.env[name];

// Provide __delay using setTimeout
g.__delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

install();
