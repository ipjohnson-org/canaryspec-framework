import type { Gen } from './types.js';

export function createGen(): Gen {
  const shortId = randomHex(4);
  const ts = Math.floor(Date.now() / 1000);
  const sfx = `${shortId}-${ts}`;

  return {
    id(label?: string): string {
      return label ? `canary-${label}-${sfx}` : `canary-${sfx}`;
    },

    prefixed(prefix: string): string {
      return `${prefix}-${sfx}`;
    },

    email(label?: string): string {
      const local = label ? `canary-${label}-${sfx}` : `canary-${sfx}`;
      return `${local}@canaryspec.local`;
    },

    number(min: number, max: number): number {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    get timestamp() {
      return ts;
    },

    get suffix() {
      return sfx;
    },
  };
}

function randomHex(length: number): string {
  // No dependency on crypto �� works in bare V8 and Node alike
  return Math.random().toString(16).substring(2, 2 + length);
}
