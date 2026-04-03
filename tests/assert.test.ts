import { describe, it, expect as ve } from 'vitest';
import { createFramework } from '../src/index.js';

function run(fn: (ctx: any) => Promise<void>) {
  const fw = createFramework();
  fw.check('test', fn);
  return fw.runCheck('test');
}

describe('assert', () => {
  it('equal passes', async () => {
    const r = await run(async ({ assert }) => { assert.equal(1, 1); });
    ve(r.status).toBe('passed');
  });
  it('equal fails', async () => {
    const r = await run(async ({ assert }) => { assert.equal(1, 2); });
    ve(r.status).toBe('failed');
  });
  it('equal with message', async () => {
    const r = await run(async ({ assert }) => { assert.equal(1, 2, 'values must match'); });
    ve(r.errorMessage).toContain('values must match');
  });
  it('notEqual passes', async () => {
    const r = await run(async ({ assert }) => { assert.notEqual(1, 2); });
    ve(r.status).toBe('passed');
  });
  it('ok passes on truthy', async () => {
    const r = await run(async ({ assert }) => { assert.ok(true); });
    ve(r.status).toBe('passed');
  });
  it('ok fails on falsy', async () => {
    const r = await run(async ({ assert }) => { assert.ok(null); });
    ve(r.status).toBe('failed');
  });
  it('fail always fails', async () => {
    const r = await run(async ({ assert }) => { assert.fail('intentional'); });
    ve(r.status).toBe('failed');
    ve(r.errorMessage).toContain('intentional');
  });
  it('greaterThan passes', async () => {
    const r = await run(async ({ assert }) => { assert.greaterThan(10, 5); });
    ve(r.status).toBe('passed');
  });
  it('lessThan passes', async () => {
    const r = await run(async ({ assert }) => { assert.lessThan(5, 10); });
    ve(r.status).toBe('passed');
  });
  it('contains passes', async () => {
    const r = await run(async ({ assert }) => { assert.contains([1, 2, 3], 2); });
    ve(r.status).toBe('passed');
  });
});
