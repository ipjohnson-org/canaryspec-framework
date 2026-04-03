import { build } from 'esbuild';

// IIFE bundle for V8 embedding — self-installs on globalThis
// The bundle is a self-executing function that calls install() internally
await build({
  entryPoints: ['src/iife.ts'],
  bundle: true,
  format: 'iife',
  outfile: 'dist/framework.bundle.js',
  target: 'es2022',
});

// ESM module for Node imports and testing
await build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  format: 'esm',
  outfile: 'dist/framework.esm.js',
  target: 'es2022',
});

console.log('Build complete: dist/framework.bundle.js + dist/framework.esm.js');
