import { describe, it, expect as ve } from 'vitest';
import { createFramework } from '../src/index.js';

function run(fn: (ctx: any) => Promise<void>) {
  const fw = createFramework();
  fw.check('test', fn);
  return fw.runCheck('test');
}

describe('metric', () => {
  it('records metric', async () => {
    const r = await run(async ({ metric }) => {
      metric('queue_depth', 42);
    });
    ve(r.metrics['queue_depth'].value).toBe(42);
  });
  it('records unit', async () => {
    const r = await run(async ({ metric }) => {
      metric('latency', 150, { unit: 'ms' });
    });
    ve(r.metrics['latency'].unit).toBe('ms');
  });
});

describe('annotate', () => {
  it('records annotation', async () => {
    const r = await run(async ({ annotate }) => {
      annotate('requestId', 'req-abc-123');
    });
    ve(r.annotations['requestId']).toBe('req-abc-123');
  });
  it('supports numbers', async () => {
    const r = await run(async ({ annotate }) => {
      annotate('count', 5);
    });
    ve(r.annotations['count']).toBe(5);
  });
});

describe('degrade', () => {
  it('marks check as degraded', async () => {
    const r = await run(async ({ degrade }) => {
      degrade('latency is elevated');
    });
    ve(r.status).toBe('degraded');
    ve(r.degradedReasons).toContain('latency is elevated');
  });
  it('multiple reasons collected', async () => {
    const r = await run(async ({ degrade }) => {
      degrade('reason 1');
      degrade('reason 2');
    });
    ve(r.degradedReasons).toHaveLength(2);
  });
});

describe('survives failure', () => {
  it('metrics survive assertion failure', async () => {
    const r = await run(async ({ metric, annotate, expect }) => {
      metric('before', 1);
      annotate('key', 'value');
      expect(1).toBe(2);
    });
    ve(r.status).toBe('failed');
    ve(r.metrics['before'].value).toBe(1);
    ve(r.annotations['key']).toBe('value');
  });
});
