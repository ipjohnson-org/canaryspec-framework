import { describe, it, expect } from 'vitest';
import { valuesEqual, isTruthy, format, parseDuration, partialMatch } from '../src/helpers.js';

describe('valuesEqual', () => {
  it('null equals null', () => expect(valuesEqual(null, null)).toBe(true));
  it('undefined equals undefined', () => expect(valuesEqual(undefined, undefined)).toBe(true));
  it('strings equal', () => expect(valuesEqual('a', 'a')).toBe(true));
  it('strings not equal', () => expect(valuesEqual('a', 'b')).toBe(false));
  it('numbers equal', () => expect(valuesEqual(1, 1)).toBe(true));
  it('booleans equal', () => expect(valuesEqual(true, true)).toBe(true));
  it('objects are reference equal only', () => {
    const obj = { a: 1 };
    expect(valuesEqual(obj, obj)).toBe(true);
    expect(valuesEqual({ a: 1 }, { a: 1 })).toBe(false);
  });
  it('null !== undefined', () => expect(valuesEqual(null, undefined)).toBe(false));
});

describe('isTruthy', () => {
  it('truthy values', () => {
    expect(isTruthy(true)).toBe(true);
    expect(isTruthy(1)).toBe(true);
    expect(isTruthy('a')).toBe(true);
    expect(isTruthy({})).toBe(true);
    expect(isTruthy([])).toBe(true);
  });
  it('falsy values', () => {
    expect(isTruthy(null)).toBe(false);
    expect(isTruthy(undefined)).toBe(false);
    expect(isTruthy(false)).toBe(false);
    expect(isTruthy(0)).toBe(false);
    expect(isTruthy('')).toBe(false);
  });
});

describe('format', () => {
  it('null', () => expect(format(null)).toBe('null'));
  it('undefined', () => expect(format(undefined)).toBe('undefined'));
  it('strings get quoted', () => expect(format('hello')).toBe('"hello"'));
  it('numbers', () => expect(format(42)).toBe('42'));
  it('objects', () => expect(format({ a: 1 })).toBe('{"a":1}'));
});

describe('parseDuration', () => {
  it('milliseconds', () => expect(parseDuration('500ms')).toBe(500));
  it('seconds', () => expect(parseDuration('2s')).toBe(2000));
  it('minutes', () => expect(parseDuration('1m')).toBe(60000));
  it('plain number', () => expect(parseDuration('100')).toBe(100));
});

describe('partialMatch', () => {
  it('primitives match', () => expect(partialMatch(1, 1)).toBe(true));
  it('primitives mismatch', () => expect(partialMatch(1, 2)).toBe(false));
  it('partial object match', () => {
    expect(partialMatch({ a: 1, b: 2, c: 3 }, { a: 1, b: 2 })).toBe(true);
  });
  it('missing key fails', () => {
    expect(partialMatch({ a: 1 }, { a: 1, b: 2 })).toBe(false);
  });
  it('nested partial match', () => {
    expect(partialMatch({ user: { id: '1', name: 'A' } }, { user: { id: '1' } })).toBe(true);
  });
  it('array match', () => {
    expect(partialMatch([1, 2, 3], [1, 2])).toBe(true);
  });
  it('array mismatch', () => {
    expect(partialMatch([1, 2], [1, 2, 3])).toBe(false);
  });
});
