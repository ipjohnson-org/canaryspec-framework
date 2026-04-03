/**
 * esbuild plugin that strips @playwright/test imports from check files.
 * This allows recorded Playwright scripts to run in CanarySpec without modification.
 *
 * Playwright's `test`, `expect`, `Page`, etc. are provided as globals by the
 * CanarySpec framework, so the import is unnecessary and would fail at runtime.
 *
 * This file is used at build time (Node.js) only — it is NOT bundled into the
 * IIFE framework bundle that runs in V8. Excluded from tsconfig type checking.
 */

const PLAYWRIGHT_IMPORT_RE = /import\s*\{[^}]*\}\s*from\s*['"]@playwright\/test['"];?\s*\n?/g;
const PLAYWRIGHT_IMPORT_STAR_RE = /import\s*\*\s*as\s+\w+\s+from\s*['"]@playwright\/test['"];?\s*\n?/g;

export function playwrightStripPlugin() {
  return {
    name: 'canary-playwright-strip',
    setup(build) {
      build.onLoad({ filter: /\.check\.ts$/ }, async (args) => {
        const fs = await import('fs');
        let source = await fs.promises.readFile(args.path, 'utf8');

        if (!source.includes('@playwright/test')) {
          return undefined;
        }

        source = source.replace(PLAYWRIGHT_IMPORT_RE, '');
        source = source.replace(PLAYWRIGHT_IMPORT_STAR_RE, '');

        return {
          contents: source,
          loader: 'ts',
        };
      });
    },
  };
}
