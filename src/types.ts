// ── Result Types ───────────────────────────────────────────────────

export type CheckStatus = 'passed' | 'failed' | 'degraded' | 'errored';

export interface CheckResult {
  name: string;
  status: CheckStatus;
  durationMs: number;
  steps: StepResult[];
  cleanups: CleanupResult[];
  timings: Record<string, TimingEntry>;
  metrics: Record<string, MetricEntry>;
  annotations: Record<string, unknown>;
  degradedReasons: string[];
  errorMessage?: string;
  errorStack?: string;
}

export interface StepResult {
  name: string;
  passed: boolean;
  durationMs: number;
  errorMessage?: string;
}

export interface CleanupResult {
  description?: string;
  passed: boolean;
  durationMs: number;
  errorMessage?: string;
}

export interface TimingEntry {
  durationMs: number;
  warn?: string;
  fail?: string;
  warnBreached: boolean;
  failBreached: boolean;
}

export interface MetricEntry {
  value: number;
  unit?: string;
}

// ── Check Options ──────────────────────────────────────────────────

export interface CheckOptions {
  schedule?: string;
  timeout?: string;
  retries?: number;
  retryDelay?: string;
  tags?: string[];
  skip?: boolean;
  policy?: 'readwrite' | { allow: { action: string; resource: string }[] };
  depends?: string[];
}

// ── Retry ──────────────────────────────────────────────────────────

export interface RetryOptions<T = void> {
  attempts: number;
  delay?: string;
  backoff?: 'fixed' | 'linear' | 'exponential';
  jitter?: boolean;
  until?: (result: T) => boolean;
}

// ── Timing ─────────────────────────────────────────────────────────

export interface TimeOptions {
  warn?: string;
  fail?: string;
}

export interface TimedResult<T> {
  result: T;
  duration: number;
}

// ── Metrics ────────────────────────────────────────────────────────

export interface MetricOptions {
  unit?: string;
  tags?: Record<string, string>;
}

// ── Fetch ──────────────────────────────────────────────────────────

export interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD';
  headers?: Record<string, string>;
  body?: string | object;
  timeout?: number;
}

export interface FetchResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  ok: boolean;
  json(): Promise<unknown>;
  text(): Promise<string>;
  arrayBuffer(): Promise<ArrayBuffer>;
}

// ── Fixtures ───────────────────────────────────────────────────────

export interface FixtureConfig {
  auto?: boolean;
}

export type FixtureFactory<V> = (
  ctx: CanaryContext,
  use: (value: V) => Promise<void>,
) => Promise<void>;

export type FixtureDefinition<V = unknown> =
  | FixtureFactory<V>
  | [FixtureFactory<V>, FixtureConfig];

export type FixtureDefinitions = Record<string, FixtureDefinition>;

// ── Gen ────────────────────────────────────────────────────────────

export interface Gen {
  id(label?: string): string;
  prefixed(prefix: string): string;
  email(label?: string): string;
  number(min: number, max: number): number;
  readonly timestamp: number;
  readonly suffix: string;
}

// ── Assert ─────────────────────────────────────────────────────────

export interface Assert {
  equal(actual: unknown, expected: unknown, message?: string): void;
  notEqual(actual: unknown, expected: unknown, message?: string): void;
  ok(value: unknown, message?: string): void;
  fail(message: string): void;
  greaterThan(actual: number, expected: number, message?: string): void;
  lessThan(actual: number, expected: number, message?: string): void;
  contains(array: unknown[], value: unknown, message?: string): void;
}

// ── Expect ─────────────────────────────────────────────────────────

export interface ExpectResult<T> {
  not: Omit<ExpectResult<T>, 'not'>;
  toBe(expected: T): void;
  toBeTruthy(): void;
  toBeFalsy(): void;
  toBeNull(): void;
  toBeUndefined(): void;
  toBeGreaterThan(expected: number): void;
  toBeLessThan(expected: number): void;
  toContain(expected: unknown): void;
  toHaveLength(expected: number): void;
  toEqual(expected: unknown): void;
  toMatch(pattern: string | RegExp): void;
  toHaveProperty(key: string, value?: unknown): void;
  toMatchObject(expected: Record<string, unknown>): void;
  toThrow(message?: string): void;
}

// ── Context ────────────────────────────────────────────────────────

export interface CanaryContext {
  fetch(url: string, options?: FetchOptions): Promise<FetchResponse>;
  assert: Assert;
  expect: <T>(actual: T, message?: string) => ExpectResult<T>;
  env: { get(name: string): string | undefined; require(name: string): string };
  step: <T = void>(name: string, fn: () => Promise<T>) => Promise<T>;
  onCleanup: {
    (fn: () => void | Promise<void>): void;
    (description: string, fn: () => void | Promise<void>): void;
  };
  time: {
    <T>(fn: () => Promise<T>): Promise<TimedResult<T>>;
    <T>(label: string, fn: () => Promise<T>): Promise<TimedResult<T>>;
    <T>(label: string, options: TimeOptions, fn: () => Promise<T>): Promise<TimedResult<T>>;
  };
  retry: <T>(options: RetryOptions<T>, fn: () => Promise<T>) => Promise<T>;
  metric(name: string, value: number, options?: MetricOptions): void;
  annotate(key: string, value: string | number | boolean): void;
  degrade(reason: string): void;
  gen: Gen;
  [key: string]: unknown;
}

// ── Extended Check ─────────────────────────────────────────────────

export interface ExtendedCheck {
  (name: string, fn: (ctx: CanaryContext) => Promise<void>): void;
  (name: string, options: CheckOptions, fn: (ctx: CanaryContext) => Promise<void>): void;
  extend(fixtures: FixtureDefinitions): ExtendedCheck;
}

// ── Framework ───────────────────────────────────────────���──────────

export interface Framework {
  check: {
    (name: string, fn: (ctx: CanaryContext) => Promise<void>): void;
    (name: string, options: CheckOptions, fn: (ctx: CanaryContext) => Promise<void>): void;
    extend(fixtures: FixtureDefinitions): ExtendedCheck;
  };
  getRegistrations(): Array<{ name: string; options?: CheckOptions }>;
  runCheck(name: string): Promise<CheckResult>;
}
