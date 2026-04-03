import type { StepResult, TimingEntry, MetricEntry, CleanupResult } from './types.js';

export interface CheckState {
  steps: StepResult[];
  cleanups: Array<{ description?: string; fn: () => void | Promise<void> }>;
  timings: Record<string, TimingEntry>;
  metrics: Record<string, MetricEntry>;
  annotations: Record<string, unknown>;
  degradedReasons: string[];
}

export function createState(): CheckState {
  return {
    steps: [],
    cleanups: [],
    timings: {},
    metrics: {},
    annotations: {},
    degradedReasons: [],
  };
}

export async function runCleanups(state: CheckState): Promise<CleanupResult[]> {
  const results: CleanupResult[] = [];
  // LIFO order
  for (let i = state.cleanups.length - 1; i >= 0; i--) {
    const { description, fn } = state.cleanups[i];
    const start = Date.now();
    try {
      await fn();
      results.push({ description, passed: true, durationMs: Date.now() - start });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      results.push({ description, passed: false, durationMs: Date.now() - start, errorMessage: msg });
    }
  }
  return results;
}
