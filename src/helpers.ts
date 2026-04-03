export function valuesEqual(a: unknown, b: unknown): boolean {
  if (a === null && b === null) return true;
  if (a === undefined && b === undefined) return true;
  if (typeof a === 'string' && typeof b === 'string') return a === b;
  if (typeof a === 'number' && typeof b === 'number') return a === b;
  if (typeof a === 'boolean' && typeof b === 'boolean') return a === b;
  return a === b; // reference equality for objects
}

export function isTruthy(value: unknown): boolean {
  return value !== null && value !== undefined && value !== false && value !== 0 && value !== '';
}

export function format(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return `"${value}"`;
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

export function parseDuration(s: string): number {
  const trimmed = s.trim().toLowerCase();
  if (trimmed.endsWith('ms')) return parseFloat(trimmed);
  if (trimmed.endsWith('s')) return parseFloat(trimmed) * 1000;
  if (trimmed.endsWith('m')) return parseFloat(trimmed) * 60000;
  return parseFloat(trimmed);
}

export function partialMatch(actual: unknown, expected: unknown): boolean {
  // Primitives — exact equality
  if (typeof expected !== 'object' || expected === null) {
    return valuesEqual(actual, expected);
  }

  // Expected is object/array — actual must also be an object
  if (typeof actual !== 'object' || actual === null) return false;

  // Array comparison
  if (Array.isArray(expected)) {
    if (!Array.isArray(actual)) return false;
    if (actual.length < expected.length) return false;
    for (let i = 0; i < expected.length; i++) {
      if (!partialMatch(actual[i], expected[i])) return false;
    }
    return true;
  }

  // Object comparison: every key in expected must match in actual
  const expectedObj = expected as Record<string, unknown>;
  const actualObj = actual as Record<string, unknown>;
  for (const key of Object.keys(expectedObj)) {
    if (!(key in actualObj)) return false;
    if (!partialMatch(actualObj[key], expectedObj[key])) return false;
  }
  return true;
}
