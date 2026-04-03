// Entry point for the IIFE bundle — auto-installs on globalThis.
// This is separate from index.ts so the ESM module doesn't auto-install.
import { install } from './index.js';
install();
