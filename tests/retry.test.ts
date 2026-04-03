import { describe, it, expect as ve } from 'vitest';
import { createFramework } from '../src/index.js';

function run(fn: (ctx: any) => Promise<void>) {
  const fw = createFramework();
  fw.check('test', fn);
  return fw.runCheck('test');
}

describe('retry', () => {
  it('succeeds on first attempt', async () => {
    const r = await run(async ({ retry, expect }) => {
      const val = await retry({ attempts: 3 }, async () => 'ok');
      expect(val).toBe('ok');
    });
    ve(r.status).toBe('passed');
  });

  it('succeeds after failures', async () => {
    const r = await run(async ({ retry, expect }) => {
      let attempts = 0;
      const val = await retry({ attempts: 5, delay: '1ms' }, async () => {
        attempts++;
        if (attempts < 3) throw new Error('not yet');
        return 'ok';
      });
      expect(val).toBe('ok');
      expect(attempts).toBe(3);
    });
    ve(r.status).toBe('passed');
  });

  it('throws on exhaustion', async () => {
    const r = await run(async ({ retry }) => {
      await retry({ attempts: 2, delay: '1ms' }, async () => {
        throw new Error('always fails');
      });
    });
    ve(r.status).toBe('errored');
    ve(r.errorMessage).toContain('always fails');
  });

  it('until predicate retries on unsatisfied', async () => {
    const r = await run(async ({ retry, expect }) => {
      let counter = 0;
      const val = await retry({
        attempts: 10,
        delay: '1ms',
        until: (v: number) => v >= 5,
      }, async () => {
        counter++;
        return counter;
      });
      expect(val).toBeGreaterThan(4);
    });
    ve(r.status).toBe('passed');
  });
});
