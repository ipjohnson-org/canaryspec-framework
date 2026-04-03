import { describe, it, expect as ve } from 'vitest';
import { createFramework } from '../src/index.js';

function run(fn: (ctx: any) => Promise<void>) {
  const fw = createFramework();
  fw.check('test', fn);
  return fw.runCheck('test');
}

describe('time', () => {
  it('unnamed returns result and duration', async () => {
    const r = await run(async ({ time, expect }) => {
      const t = await time(async () => 42);
      expect(t.result).toBe(42);
      expect(t.duration).toBeGreaterThan(-1);
    });
    ve(r.status).toBe('passed');
  });

  it('named emits timing entry', async () => {
    const r = await run(async ({ time }) => {
      await time('my-op', async () => 'done');
    });
    ve(r.status).toBe('passed');
    ve(r.timings['my-op']).toBeDefined();
    ve(r.timings['my-op'].durationMs).toBeGreaterThanOrEqual(0);
  });

  it('warn threshold not breached', async () => {
    const r = await run(async ({ time }) => {
      await time('fast', { warn: '5s', fail: '10s' }, async () => {});
    });
    ve(r.status).toBe('passed');
    ve(r.timings['fast'].warnBreached).toBe(false);
    ve(r.timings['fast'].failBreached).toBe(false);
  });

  it('warn threshold breached', async () => {
    const r = await run(async ({ time }) => {
      await time('slow', { warn: '0ms', fail: '10s' }, async () => {});
    });
    ve(r.status).toBe('passed');
    ve(r.timings['slow'].warnBreached).toBe(true);
  });
});
