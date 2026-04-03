import type { CheckState } from './state.js';
import type { MetricOptions } from './types.js';

export function createMetric(state: CheckState) {
  return function metric(name: string, value: number, options?: MetricOptions) {
    state.metrics[name] = { value, unit: options?.unit };
  };
}

export function createAnnotate(state: CheckState) {
  return function annotate(key: string, value: string | number | boolean) {
    state.annotations[key] = value;
  };
}

export function createDegrade(state: CheckState) {
  return function degrade(reason: string) {
    state.degradedReasons.push(reason);
  };
}
