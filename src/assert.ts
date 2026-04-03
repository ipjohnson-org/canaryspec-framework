import { AssertError } from './errors.js';
import { valuesEqual, isTruthy, format } from './helpers.js';
import type { Assert } from './types.js';

export function createAssert(): Assert {
  return {
    equal(actual: unknown, expected: unknown, message?: string) {
      if (!valuesEqual(actual, expected)) {
        const prefix = message ? `${message}: ` : '';
        throw new AssertError(`${prefix}expected ${format(actual)} to equal ${format(expected)}`);
      }
    },

    notEqual(actual: unknown, expected: unknown, message?: string) {
      if (valuesEqual(actual, expected)) {
        const prefix = message ? `${message}: ` : '';
        throw new AssertError(`${prefix}expected ${format(actual)} not to equal ${format(expected)}`);
      }
    },

    ok(value: unknown, message?: string) {
      if (!isTruthy(value)) {
        const prefix = message ? `${message}: ` : '';
        throw new AssertError(`${prefix}expected ${format(value)} to be truthy`);
      }
    },

    fail(message: string) {
      throw new AssertError(message);
    },

    greaterThan(actual: number, expected: number, message?: string) {
      if (!(actual > expected)) {
        const prefix = message ? `${message}: ` : '';
        throw new AssertError(`${prefix}expected ${actual} to be greater than ${expected}`);
      }
    },

    lessThan(actual: number, expected: number, message?: string) {
      if (!(actual < expected)) {
        const prefix = message ? `${message}: ` : '';
        throw new AssertError(`${prefix}expected ${actual} to be less than ${expected}`);
      }
    },

    contains(array: unknown[], value: unknown, message?: string) {
      if (!array.some(item => valuesEqual(item, value))) {
        const prefix = message ? `${message}: ` : '';
        throw new AssertError(`${prefix}expected array to contain ${format(value)}`);
      }
    },
  };
}
