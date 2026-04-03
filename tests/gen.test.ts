import { describe, it, expect as ve } from 'vitest';
import { createFramework } from '../src/index.js';

function run(fn: (ctx: any) => Promise<void>) {
  const fw = createFramework();
  fw.check('test', fn);
  return fw.runCheck('test');
}

describe('gen', () => {
  it('id with label', async () => {
    const r = await run(async ({ gen, expect }) => {
      const id = gen.id('recipe');
      expect(id).toContain('canary-recipe-');
    });
    ve(r.status).toBe('passed');
  });

  it('email with label', async () => {
    const r = await run(async ({ gen, expect }) => {
      const email = gen.email('test');
      expect(email).toContain('@canaryspec.local');
      expect(email).toContain('canary-test-');
    });
    ve(r.status).toBe('passed');
  });

  it('prefixed', async () => {
    const r = await run(async ({ gen, expect }) => {
      const val = gen.prefixed('custom');
      expect(val).toContain('custom-');
    });
    ve(r.status).toBe('passed');
  });

  it('number in range', async () => {
    const r = await run(async ({ gen, expect }) => {
      const n = gen.number(1, 10);
      expect(n).toBeGreaterThan(0);
      expect(n).toBeLessThan(11);
    });
    ve(r.status).toBe('passed');
  });

  it('timestamp is positive', async () => {
    const r = await run(async ({ gen, expect }) => {
      expect(gen.timestamp).toBeGreaterThan(0);
    });
    ve(r.status).toBe('passed');
  });

  it('suffix is shared', async () => {
    const r = await run(async ({ gen, expect }) => {
      const id = gen.id('a');
      expect(id).toContain(gen.suffix);
    });
    ve(r.status).toBe('passed');
  });
});
