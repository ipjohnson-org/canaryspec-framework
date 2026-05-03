import { describe, it, expect as ve } from 'vitest';
import { createFramework } from '../src/index.js';

describe('fixtures', () => {
  it('basic fixture provides value', async () => {
    const fw = createFramework();
    const withCounter = fw.check.extend({
      counter: async ({}, use) => { await use(42); },
    });
    withCounter('test', async ({ expect, counter }) => {
      expect(counter).toBe(42);
    });
    const r = await fw.runCheck('test');
    ve(r.status).toBe('passed');
  });

  it('chained fixtures accumulate', async () => {
    const fw = createFramework();
    const base = fw.check.extend({
      counter: async ({}, use) => { await use(42); },
    });
    const extended = base.extend({
      name: async ({}, use) => { await use('canary'); },
    });
    extended('test', async ({ expect, counter, name }) => {
      expect(counter).toBe(42);
      expect(name).toBe('canary');
    });
    const r = await fw.runCheck('test');
    ve(r.status).toBe('passed');
  });

  it('fixture dependencies resolve', async () => {
    const fw = createFramework();
    const withDerived = fw.check.extend({
      baseValue: async ({}, use) => { await use(10); },
      derivedValue: async ({ baseValue }, use) => { await use((baseValue as number) * 2); },
    });
    withDerived('test', async ({ expect, baseValue, derivedValue }) => {
      expect(baseValue).toBe(10);
      expect(derivedValue).toBe(20);
    });
    const r = await fw.runCheck('test');
    ve(r.status).toBe('passed');
  });

  it('teardown runs after check body', async () => {
    const fw = createFramework();
    const order: string[] = [];
    const withResource = fw.check.extend({
      resource: async ({}, use) => {
        order.push('setup');
        await use('value');
        order.push('teardown');
      },
    });
    withResource('test', async ({ expect, resource }) => {
      order.push('body');
      expect(resource).toBe('value');
    });
    await fw.runCheck('test');
    ve(order).toEqual(['setup', 'body', 'teardown']);
  });

  it('teardown runs on failure', async () => {
    const fw = createFramework();
    let tornDown = false;
    const withResource = fw.check.extend({
      resource: async ({}, use) => {
        await use('value');
        tornDown = true;
      },
    });
    withResource('test', async ({ expect }) => {
      expect(1).toBe(2); // fail
    });
    const r = await fw.runCheck('test');
    ve(r.status).toBe('failed');
    ve(tornDown).toBe(true);
  });

  it('multiple fixtures all available', async () => {
    const fw = createFramework();
    const withMulti = fw.check.extend({
      first: async ({}, use) => { await use('first'); },
      second: async ({}, use) => { await use('second'); },
      third: async ({}, use) => { await use('third'); },
    });
    withMulti('test', async ({ expect, first, second, third }) => {
      expect(first).toBe('first');
      expect(second).toBe('second');
      expect(third).toBe('third');
    });
    const r = await fw.runCheck('test');
    ve(r.status).toBe('passed');
  });

  it('extended check with options', async () => {
    const fw = createFramework();
    const base = fw.check.extend({
      val: async ({}, use) => { await use(1); },
    });
    base('test', { tags: ['critical'] }, async ({ expect, val }) => {
      expect(val).toBe(1);
    });
    const regs = fw.getRegistrations();
    ve(regs[0].options?.tags).toEqual(['critical']);
    const r = await fw.runCheck('test');
    ve(r.status).toBe('passed');
  });

  it('fixture that throws before use() errors instead of hanging', async () => {
    const fw = createFramework();
    const withFailingAuth = fw.check.extend({
      auth: async ({}, _use) => {
        throw new Error('login failed');
      },
    });
    withFailingAuth('test', async () => {
      // body should never execute
    });
    const r = await fw.runCheck('test');
    ve(r.status).toBe('errored');
    ve(r.errorMessage).toBe('login failed');
  });

  it('fixture that returns without calling use() errors instead of hanging', async () => {
    const fw = createFramework();
    const withForgotten = fw.check.extend({
      forgotten: async ({}, _use) => {
        // forgot to call use()
      },
    });
    withForgotten('test', async () => {
      // body should never execute
    });
    const r = await fw.runCheck('test');
    ve(r.status).toBe('errored');
    ve(r.errorMessage).toMatch(/completed without calling use\(\)/);
  });
});
