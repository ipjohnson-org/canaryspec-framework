import { describe, it, expect as ve } from 'vitest';
import { createFramework } from '../src/index.js';

function run(fn: (ctx: any) => Promise<void>) {
  const fw = createFramework();
  fw.check('test', fn);
  return fw.runCheck('test');
}

describe('expect.toBe', () => {
  it('passes on equal', async () => {
    const r = await run(async ({ expect }) => { expect(1).toBe(1); });
    ve(r.status).toBe('passed');
  });
  it('fails on not equal', async () => {
    const r = await run(async ({ expect }) => { expect(1).toBe(2); });
    ve(r.status).toBe('failed');
    ve(r.errorMessage).toContain('expected 1 to be 2');
  });
  it('strings', async () => {
    const r = await run(async ({ expect }) => { expect('hello').toBe('hello'); });
    ve(r.status).toBe('passed');
  });
});

describe('expect.toBeTruthy / toBeFalsy', () => {
  it('truthy passes', async () => {
    const r = await run(async ({ expect }) => {
      expect(true).toBeTruthy();
      expect(1).toBeTruthy();
      expect('a').toBeTruthy();
    });
    ve(r.status).toBe('passed');
  });
  it('falsy passes', async () => {
    const r = await run(async ({ expect }) => {
      expect(false).toBeFalsy();
      expect(0).toBeFalsy();
      expect('').toBeFalsy();
      expect(null).toBeFalsy();
      expect(undefined).toBeFalsy();
    });
    ve(r.status).toBe('passed');
  });
  it('truthy fails on null', async () => {
    const r = await run(async ({ expect }) => { expect(null).toBeTruthy(); });
    ve(r.status).toBe('failed');
  });
});

describe('expect.toBeNull / toBeUndefined', () => {
  it('null passes', async () => {
    const r = await run(async ({ expect }) => { expect(null).toBeNull(); });
    ve(r.status).toBe('passed');
  });
  it('non-null fails', async () => {
    const r = await run(async ({ expect }) => { expect(42).toBeNull(); });
    ve(r.status).toBe('failed');
  });
  it('undefined passes', async () => {
    const r = await run(async ({ expect }) => { expect(undefined).toBeUndefined(); });
    ve(r.status).toBe('passed');
  });
  it('defined fails', async () => {
    const r = await run(async ({ expect }) => { expect('hi').toBeUndefined(); });
    ve(r.status).toBe('failed');
  });
});

describe('expect comparisons', () => {
  it('toBeGreaterThan', async () => {
    const r = await run(async ({ expect }) => { expect(10).toBeGreaterThan(5); });
    ve(r.status).toBe('passed');
  });
  it('toBeLessThan', async () => {
    const r = await run(async ({ expect }) => { expect(3).toBeLessThan(10); });
    ve(r.status).toBe('passed');
  });
  it('toHaveLength', async () => {
    const r = await run(async ({ expect }) => { expect([1, 2, 3]).toHaveLength(3); });
    ve(r.status).toBe('passed');
  });
  it('toContain string', async () => {
    const r = await run(async ({ expect }) => { expect('canaryspec').toContain('canary'); });
    ve(r.status).toBe('passed');
  });
  it('toContain array', async () => {
    const r = await run(async ({ expect }) => { expect([10, 20, 30]).toContain(20); });
    ve(r.status).toBe('passed');
  });
});

describe('expect.not', () => {
  it('not.toBe passes', async () => {
    const r = await run(async ({ expect }) => { expect(1).not.toBe(2); });
    ve(r.status).toBe('passed');
  });
  it('not.toBe fails on equal', async () => {
    const r = await run(async ({ expect }) => { expect(1).not.toBe(1); });
    ve(r.status).toBe('failed');
    ve(r.errorMessage).toContain('not to be');
  });
  it('not.toContain', async () => {
    const r = await run(async ({ expect }) => { expect('hello').not.toContain('xyz'); });
    ve(r.status).toBe('passed');
  });
  it('not.toBeNull', async () => {
    const r = await run(async ({ expect }) => { expect('value').not.toBeNull(); });
    ve(r.status).toBe('passed');
  });
});

describe('expect.toMatch', () => {
  it('string pattern', async () => {
    const r = await run(async ({ expect }) => { expect('hello world').toMatch('hello'); });
    ve(r.status).toBe('passed');
  });
  it('regex pattern', async () => {
    const r = await run(async ({ expect }) => { expect('hello world').toMatch(/^hello/); });
    ve(r.status).toBe('passed');
  });
  it('case insensitive regex', async () => {
    const r = await run(async ({ expect }) => { expect('Hello').toMatch(/hello/i); });
    ve(r.status).toBe('passed');
  });
  it('fails on no match', async () => {
    const r = await run(async ({ expect }) => { expect('hello').toMatch(/^world/); });
    ve(r.status).toBe('failed');
  });
  it('not.toMatch', async () => {
    const r = await run(async ({ expect }) => { expect('hello').not.toMatch(/xyz/); });
    ve(r.status).toBe('passed');
  });
});

describe('expect.toHaveProperty', () => {
  it('exists only', async () => {
    const r = await run(async ({ expect }) => {
      expect({ name: 'canary', status: 200 }).toHaveProperty('name');
    });
    ve(r.status).toBe('passed');
  });
  it('missing fails', async () => {
    const r = await run(async ({ expect }) => {
      expect({ name: 'canary' }).toHaveProperty('missing');
    });
    ve(r.status).toBe('failed');
  });
  it('with value', async () => {
    const r = await run(async ({ expect }) => {
      expect({ status: 200 }).toHaveProperty('status', 200);
    });
    ve(r.status).toBe('passed');
  });
  it('wrong value fails', async () => {
    const r = await run(async ({ expect }) => {
      expect({ status: 404 }).toHaveProperty('status', 200);
    });
    ve(r.status).toBe('failed');
  });
  it('not.toHaveProperty', async () => {
    const r = await run(async ({ expect }) => {
      expect({ a: 1 }).not.toHaveProperty('b');
    });
    ve(r.status).toBe('passed');
  });
});

describe('expect.toMatchObject', () => {
  it('partial match passes', async () => {
    const r = await run(async ({ expect }) => {
      expect({ name: 'canary', status: 200, region: 'us-east-1' }).toMatchObject({ name: 'canary', status: 200 });
    });
    ve(r.status).toBe('passed');
  });
  it('mismatch fails', async () => {
    const r = await run(async ({ expect }) => {
      expect({ name: 'canary', status: 404 }).toMatchObject({ status: 200 });
    });
    ve(r.status).toBe('failed');
  });
  it('nested partial match', async () => {
    const r = await run(async ({ expect }) => {
      expect({ user: { id: '123', name: 'Alice', email: 'a@b.com' } }).toMatchObject({ user: { id: '123' } });
    });
    ve(r.status).toBe('passed');
  });
  it('missing key fails', async () => {
    const r = await run(async ({ expect }) => {
      expect({ name: 'canary' }).toMatchObject({ name: 'canary', missing: true });
    });
    ve(r.status).toBe('failed');
  });
  it('not.toMatchObject', async () => {
    const r = await run(async ({ expect }) => {
      expect({ a: 1 }).not.toMatchObject({ b: 2 });
    });
    ve(r.status).toBe('passed');
  });
});

describe('expect.toThrow', () => {
  it('passes when throws', async () => {
    const r = await run(async ({ expect }) => {
      expect(() => { throw new Error('boom'); }).toThrow();
    });
    ve(r.status).toBe('passed');
  });
  it('fails when no throw', async () => {
    const r = await run(async ({ expect }) => {
      expect(() => 1).toThrow();
    });
    ve(r.status).toBe('failed');
  });
  it('with message match', async () => {
    const r = await run(async ({ expect }) => {
      expect(() => { throw new Error('connection refused'); }).toThrow('connection');
    });
    ve(r.status).toBe('passed');
  });
  it('wrong message fails', async () => {
    const r = await run(async ({ expect }) => {
      expect(() => { throw new Error('timeout'); }).toThrow('connection');
    });
    ve(r.status).toBe('failed');
  });
  it('not.toThrow', async () => {
    const r = await run(async ({ expect }) => {
      expect(() => 'ok').not.toThrow();
    });
    ve(r.status).toBe('passed');
  });
});

describe('expect with custom message', () => {
  it('includes message in error', async () => {
    const r = await run(async ({ expect }) => {
      expect(404, 'API should return 200').toBe(200);
    });
    ve(r.status).toBe('failed');
    ve(r.errorMessage).toContain('API should return 200');
  });
});
