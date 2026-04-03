import { describe, it, expect as ve } from 'vitest';
import { createFramework } from '../src/index.js';

function run(fn: (ctx: any) => Promise<void>) {
  const fw = createFramework();
  fw.check('test', fn);
  return fw.runCheck('test');
}

describe('cleanup', () => {
  it('runs after check body', async () => {
    const r = await run(async ({ onCleanup }) => {
      onCleanup('resource A', () => {});
    });
    ve(r.status).toBe('passed');
    ve(r.cleanups).toHaveLength(1);
    ve(r.cleanups[0].description).toBe('resource A');
    ve(r.cleanups[0].passed).toBe(true);
  });

  it('LIFO order', async () => {
    const order: string[] = [];
    const r = await run(async ({ onCleanup }) => {
      onCleanup('first', () => { order.push('first'); });
      onCleanup('second', () => { order.push('second'); });
      onCleanup('third', () => { order.push('third'); });
    });
    ve(r.status).toBe('passed');
    ve(r.cleanups).toHaveLength(3);
    ve(r.cleanups[0].description).toBe('third');
    ve(r.cleanups[1].description).toBe('second');
    ve(r.cleanups[2].description).toBe('first');
  });

  it('runs on failure', async () => {
    const r = await run(async ({ onCleanup, expect }) => {
      onCleanup('cleanup', () => {});
      expect(1).toBe(2);
    });
    ve(r.status).toBe('failed');
    ve(r.cleanups).toHaveLength(1);
    ve(r.cleanups[0].passed).toBe(true);
  });

  it('anonymous cleanup', async () => {
    const r = await run(async ({ onCleanup }) => {
      onCleanup(() => {});
    });
    ve(r.cleanups).toHaveLength(1);
    ve(r.cleanups[0].description).toBeUndefined();
  });
});
