// Host-provided globals. These are NOT V8 built-ins — each host must provide them.
// See node/bootstrap.ts for the Node implementation.

// No ambient declarations needed — all host globals are accessed via
// (globalThis as Record<string, unknown>).__name pattern in the source.
