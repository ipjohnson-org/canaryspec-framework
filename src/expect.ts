import { AssertError } from './errors.js';
import { valuesEqual, isTruthy, format, partialMatch } from './helpers.js';
import type { ExpectResult } from './types.js';

export function createExpect() {
  return function expect<T>(actual: T, message?: string): ExpectResult<T> {
    return makeResult(actual, false, message);
  };
}

function makeResult<T>(actual: T, negated: boolean, message?: string): ExpectResult<T> {
  const prefix = message ? `${message}: ` : '';
  const not = negated ? ' not' : '';

  function check(pass: boolean, msg: string): void {
    if (negated ? pass : !pass) {
      throw new AssertError(`${prefix}${msg}`);
    }
  }

  const result: ExpectResult<T> = {
    toBe(expected: T) {
      check(valuesEqual(actual, expected), `expected ${format(actual)}${not} to be ${format(expected)}`);
    },

    toBeTruthy() {
      check(isTruthy(actual), `expected ${format(actual)}${not} to be truthy`);
    },

    toBeFalsy() {
      check(!isTruthy(actual), `expected ${format(actual)}${not} to be falsy`);
    },

    toBeNull() {
      check(actual === null, `expected ${format(actual)}${not} to be null`);
    },

    toBeUndefined() {
      check(actual === undefined, `expected ${format(actual)}${not} to be undefined`);
    },

    toBeGreaterThan(expected: number) {
      check((actual as number) > expected, `expected ${actual}${not} to be greater than ${expected}`);
    },

    toBeLessThan(expected: number) {
      check((actual as number) < expected, `expected ${actual}${not} to be less than ${expected}`);
    },

    toContain(expected: unknown) {
      let pass = false;
      if (typeof actual === 'string' && typeof expected === 'string') {
        pass = actual.includes(expected);
      } else if (Array.isArray(actual)) {
        pass = actual.some(item => valuesEqual(item, expected));
      }
      check(pass, `expected ${format(actual)}${not} to contain ${format(expected)}`);
    },

    toHaveLength(expected: number) {
      const len = (actual as unknown as { length: number }).length;
      check(len === expected, `expected length ${len}${not} to be ${expected}`);
    },

    toEqual(expected: unknown) {
      check(valuesEqual(actual, expected), `expected ${format(actual)}${not} to be ${format(expected)}`);
    },

    toMatch(pattern: string | RegExp) {
      if (typeof actual !== 'string') {
        throw new AssertError('toMatch requires a string actual value');
      }
      const re = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
      const pass = re.test(actual);
      const desc = typeof pattern === 'string' ? `/${pattern}/` : String(pattern);
      check(pass, `expected "${actual}"${not} to match ${desc}`);
    },

    toHaveProperty(key: string, ...args: unknown[]) {
      if (typeof actual !== 'object' || actual === null) {
        throw new AssertError(`toHaveProperty requires an object, got ${format(actual)}`);
      }
      const obj = actual as Record<string, unknown>;
      const exists = key in obj;
      const checkValue = args.length > 0;
      const pass = exists && (!checkValue || valuesEqual(obj[key], args[0]));
      const valueClause = checkValue ? ` with value ${format(args[0])}` : '';
      check(pass, `expected object${not} to have property "${key}"${valueClause}`);
    },

    toMatchObject(expected: Record<string, unknown>) {
      const pass = partialMatch(actual, expected);
      check(pass, `expected object${not} to match partial object`);
    },

    toThrow(expectedMessage?: string) {
      if (typeof actual !== 'function') {
        throw new AssertError('toThrow requires a function');
      }
      let threw = false;
      let thrownMessage: string | undefined;
      try {
        (actual as () => void)();
      } catch (e: unknown) {
        threw = true;
        thrownMessage = e instanceof Error ? e.message : String(e);
      }
      let pass: boolean;
      if (expectedMessage !== undefined) {
        pass = threw && (thrownMessage?.includes(expectedMessage) ?? false);
      } else {
        pass = threw;
      }
      const detail = expectedMessage !== undefined ? ` with message containing "${expectedMessage}"` : '';
      check(pass, `expected function${not} to throw${detail}`);
    },

    not: undefined as unknown as Omit<ExpectResult<T>, 'not'>,
  };

  if (!negated) {
    result.not = makeResult(actual, true, message) as Omit<ExpectResult<T>, 'not'>;
  }

  return result;
}
