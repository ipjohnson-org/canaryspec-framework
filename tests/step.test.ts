import { describe, it, expect as ve } from 'vitest';
import { createFramework } from '../src/index.js';

function run(fn: (ctx: any) => Promise<void>) {
  const fw = createFramework();
  fw.check('test', fn);
  return fw.runCheck('test');
}

describe('step', () => {
  it('records timing', async () => {
    const r = await run(async ({ step }) => {
      await step('my step', async () => {});
    });
    ve(r.status).toBe('passed');
    ve(r.steps).toHaveLength(1);
    ve(r.steps[0].name).toBe('my step');
    ve(r.steps[0].passed).toBe(true);
    ve(r.steps[0].durationMs).toBeGreaterThanOrEqual(0);
  });

  it('returns value', async () => {
    const r = await run(async ({ step, expect }) => {
      const val = await step('compute', async () => 42);
      expect(val).toBe(42);
    });
    ve(r.status).toBe('passed');
  });

  it('value flows between steps', async () => {
    const r = await run(async ({ step, expect }) => {
      const id = await step('create', async () => 'abc-123');
      await step('verify', async () => { expect(id).toBe('abc-123'); });
    });
    ve(r.status).toBe('passed');
    ve(r.steps).toHaveLength(2);
  });

  it('failure records error', async () => {
    const r = await run(async ({ step, expect }) => {
      await step('failing', async () => { expect(1).toBe(2); });
    });
    ve(r.status).toBe('failed');
    ve(r.steps).toHaveLength(1);
    ve(r.steps[0].passed).toBe(false);
    ve(r.steps[0].errorMessage).toContain('expected 1 to be 2');
  });

  it('failure stops subsequent steps', async () => {
    const r = await run(async ({ step, expect }) => {
      await step('first', async () => { expect(1).toBe(2); });
      await step('second', async () => {}); // should not run
    });
    ve(r.status).toBe('failed');
    ve(r.steps).toHaveLength(1);
  });

  it('multiple steps all recorded', async () => {
    const r = await run(async ({ step }) => {
      await step('A', async () => {});
      await step('B', async () => {});
      await step('C', async () => {});
    });
    ve(r.steps).toHaveLength(3);
    ve(r.steps[0].name).toBe('A');
    ve(r.steps[1].name).toBe('B');
    ve(r.steps[2].name).toBe('C');
  });
});
