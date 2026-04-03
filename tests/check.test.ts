import { describe, it, expect as ve } from 'vitest';
import { createFramework } from '../src/index.js';

describe('check registration', () => {
  it('registers and runs a check', async () => {
    const fw = createFramework();
    fw.check('basic', async ({ expect }) => {
      expect(1 + 1).toBe(2);
    });
    const r = await fw.runCheck('basic');
    ve(r.status).toBe('passed');
    ve(r.name).toBe('basic');
    ve(r.durationMs).toBeGreaterThanOrEqual(0);
  });

  it('multiple checks registered', async () => {
    const fw = createFramework();
    fw.check('a', async () => {});
    fw.check('b', async () => {});
    fw.check('c', async () => {});
    const regs = fw.getRegistrations();
    ve(regs).toHaveLength(3);
    ve(regs.map(r => r.name)).toEqual(['a', 'b', 'c']);
  });

  it('check with options', async () => {
    const fw = createFramework();
    fw.check('opt', { tags: ['api'], schedule: '5m' }, async () => {});
    const regs = fw.getRegistrations();
    ve(regs[0].options?.tags).toEqual(['api']);
    ve(regs[0].options?.schedule).toBe('5m');
  });

  it('unknown check returns errored', async () => {
    const fw = createFramework();
    const r = await fw.runCheck('nonexistent');
    ve(r.status).toBe('errored');
    ve(r.errorMessage).toContain('not found');
  });

  it('assertion failure returns failed', async () => {
    const fw = createFramework();
    fw.check('fail', async ({ expect }) => { expect(1).toBe(2); });
    const r = await fw.runCheck('fail');
    ve(r.status).toBe('failed');
    ve(r.errorStack).toBeUndefined();
  });

  it('runtime error returns errored with stack', async () => {
    const fw = createFramework();
    fw.check('err', async () => { throw new Error('runtime boom'); });
    const r = await fw.runCheck('err');
    ve(r.status).toBe('errored');
    ve(r.errorMessage).toBe('runtime boom');
    ve(r.errorStack).toBeDefined();
  });

  it('framework instances are isolated', async () => {
    const fw1 = createFramework();
    const fw2 = createFramework();
    fw1.check('a', async () => {});
    fw2.check('b', async () => {});
    ve(fw1.getRegistrations()).toHaveLength(1);
    ve(fw2.getRegistrations()).toHaveLength(1);
    ve(fw1.getRegistrations()[0].name).toBe('a');
    ve(fw2.getRegistrations()[0].name).toBe('b');
  });
});
