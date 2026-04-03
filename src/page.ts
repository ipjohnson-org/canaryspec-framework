import type { Gen } from './types.js';

// ── Host binding type ─────────────────────────────────────────────

type PageHost = (method: string, ...args: unknown[]) => Promise<unknown>;

// ── Public types ──────────────────────────────────────────────────

export interface GotoOptions {
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' | 'commit';
  timeout?: number;
}

export interface GotoResult {
  url: string;
  status: number;
  ok: boolean;
}

export interface ClickOptions {
  button?: 'left' | 'right' | 'middle';
  clickCount?: number;
  delay?: number;
  timeout?: number;
  force?: boolean;
}

export interface FillOptions {
  timeout?: number;
  force?: boolean;
}

export interface ScreenshotOptions {
  path?: string;
  fullPage?: boolean;
  type?: 'png' | 'jpeg';
  quality?: number;
}

export interface WaitForSelectorOptions {
  state?: 'attached' | 'detached' | 'visible' | 'hidden';
  timeout?: number;
}

export interface SelectOptionValue {
  value?: string;
  label?: string;
  index?: number;
}

export interface AutoFillOptions {
  seedWith?: Record<string, unknown>;
}

export interface FillWithAction {
  with(data: Record<string, unknown>): Promise<void>;
}

export interface PageClass {
  url?: string | RegExp;
  validate?: (page: Page) => Promise<void>;
}

// ── Page interface ────────────────────────────────────────────────

export interface Page {
  // Navigation
  goto(url: string, options?: GotoOptions): Promise<GotoResult>;
  waitForURL(url: string | RegExp, options?: { timeout?: number }): Promise<void>;
  goBack(options?: { waitUntil?: string; timeout?: number }): Promise<void>;
  goForward(options?: { waitUntil?: string; timeout?: number }): Promise<void>;
  reload(options?: { waitUntil?: string; timeout?: number }): Promise<void>;

  // Info
  title(): Promise<string>;
  url(): string;
  content(): Promise<string>;

  // Element interaction
  click(selector: string, options?: ClickOptions): Promise<void>;
  dblclick(selector: string, options?: ClickOptions): Promise<void>;
  fill(selector: string, value: string, options?: FillOptions): Promise<void>;
  // Overload: fill(selector).with(object) for form filling
  fill(selector: string): FillWithAction;
  type(selector: string, text: string, options?: { delay?: number }): Promise<void>;
  press(selector: string, key: string, options?: { delay?: number }): Promise<void>;
  check(selector: string, options?: { timeout?: number; force?: boolean }): Promise<void>;
  uncheck(selector: string, options?: { timeout?: number; force?: boolean }): Promise<void>;
  selectOption(selector: string, values: string | SelectOptionValue | string[] | SelectOptionValue[]): Promise<string[]>;
  hover(selector: string, options?: { timeout?: number; force?: boolean }): Promise<void>;
  focus(selector: string, options?: { timeout?: number }): Promise<void>;

  // Querying
  textContent(selector: string, options?: { timeout?: number }): Promise<string | null>;
  innerText(selector: string, options?: { timeout?: number }): Promise<string>;
  innerHTML(selector: string, options?: { timeout?: number }): Promise<string>;
  getAttribute(selector: string, name: string, options?: { timeout?: number }): Promise<string | null>;
  inputValue(selector: string, options?: { timeout?: number }): Promise<string>;
  isVisible(selector: string, options?: { timeout?: number }): Promise<boolean>;
  isChecked(selector: string, options?: { timeout?: number }): Promise<boolean>;

  // Waiting
  waitForSelector(selector: string, options?: WaitForSelectorOptions): Promise<void>;
  waitForTimeout(timeout: number): Promise<void>;
  waitForLoadState(state?: 'load' | 'domcontentloaded' | 'networkidle'): Promise<void>;

  // Locators (Playwright-compatible)
  getByRole(role: string, options?: { name?: string | RegExp; exact?: boolean }): Locator;
  getByText(text: string | RegExp, options?: { exact?: boolean }): Locator;
  getByLabel(text: string | RegExp, options?: { exact?: boolean }): Locator;
  getByPlaceholder(text: string | RegExp, options?: { exact?: boolean }): Locator;
  getByTestId(testId: string | RegExp): Locator;
  locator(selector: string): Locator;

  // Evaluate
  evaluate<T = unknown>(expression: string): Promise<T>;
  evaluate<T = unknown>(fn: (...args: unknown[]) => T, arg?: unknown): Promise<T>;

  // Screenshot
  screenshot(options?: ScreenshotOptions): Promise<string>;

  // Helpers
  autoFill(selector: string, options?: AutoFillOptions): Promise<void>;
  yields<T>(pageClass: PageClass & (new (...args: unknown[]) => T)): Promise<T>;
}

// ── Locator interface ─────────────────────────────────────────────

export interface Locator {
  // Actions
  click(options?: ClickOptions): Promise<void>;
  dblclick(options?: ClickOptions): Promise<void>;
  fill(value: string, options?: FillOptions): Promise<void>;
  type(text: string, options?: { delay?: number }): Promise<void>;
  press(key: string, options?: { delay?: number }): Promise<void>;
  check(options?: { timeout?: number; force?: boolean }): Promise<void>;
  uncheck(options?: { timeout?: number; force?: boolean }): Promise<void>;
  selectOption(values: string | SelectOptionValue | string[] | SelectOptionValue[]): Promise<string[]>;
  hover(options?: { timeout?: number; force?: boolean }): Promise<void>;
  focus(options?: { timeout?: number }): Promise<void>;

  // Querying
  textContent(options?: { timeout?: number }): Promise<string | null>;
  innerText(options?: { timeout?: number }): Promise<string>;
  innerHTML(options?: { timeout?: number }): Promise<string>;
  getAttribute(name: string, options?: { timeout?: number }): Promise<string | null>;
  inputValue(options?: { timeout?: number }): Promise<string>;
  isVisible(options?: { timeout?: number }): Promise<boolean>;
  isChecked(options?: { timeout?: number }): Promise<boolean>;
  isEnabled(options?: { timeout?: number }): Promise<boolean>;
  isHidden(options?: { timeout?: number }): Promise<boolean>;

  // Filtering & chaining
  first(): Locator;
  last(): Locator;
  nth(index: number): Locator;
  count(): Promise<number>;
  locator(selector: string): Locator;
  getByRole(role: string, options?: { name?: string | RegExp; exact?: boolean }): Locator;
  getByText(text: string | RegExp, options?: { exact?: boolean }): Locator;
  getByLabel(text: string | RegExp, options?: { exact?: boolean }): Locator;
  getByTestId(testId: string | RegExp): Locator;
  filter(options: { hasText?: string | RegExp; has?: Locator }): Locator;

  // Evaluate
  evaluate<T = unknown>(expression: string): Promise<T>;
  evaluate<T = unknown>(fn: (el: Element, ...args: unknown[]) => T, arg?: unknown): Promise<T>;

  // Screenshot
  screenshot(options?: ScreenshotOptions): Promise<string>;

  // Waiting
  waitFor(options?: WaitForSelectorOptions): Promise<void>;
}

// ── Implementation ────────────────────────────────────────────────

function getHost(): PageHost {
  const host = (globalThis as Record<string, unknown>).__page as PageHost | undefined;
  if (!host) {
    throw new Error('__page host binding is not available. Ensure the browser shim is registered.');
  }
  return host;
}

function serializeOptions(options?: Record<string, unknown>): string | undefined {
  return options ? JSON.stringify(options) : undefined;
}

function serializeLocatorArg(value: string | RegExp): string {
  if (value instanceof RegExp) {
    return JSON.stringify({ __regex: value.source, flags: value.flags });
  }
  return JSON.stringify(value);
}

function createLocator(host: PageHost, selector: string): Locator {
  return {
    // Actions
    async click(options?) {
      await host('locator.click', selector, serializeOptions(options));
    },
    async dblclick(options?) {
      await host('locator.dblclick', selector, serializeOptions(options));
    },
    async fill(value, options?) {
      await host('locator.fill', selector, value, serializeOptions(options));
    },
    async type(text, options?) {
      await host('locator.type', selector, text, serializeOptions(options));
    },
    async press(key, options?) {
      await host('locator.press', selector, key, serializeOptions(options));
    },
    async check(options?) {
      await host('locator.check', selector, serializeOptions(options));
    },
    async uncheck(options?) {
      await host('locator.uncheck', selector, serializeOptions(options));
    },
    async selectOption(values) {
      return host('locator.selectOption', selector, JSON.stringify(values)) as Promise<string[]>;
    },
    async hover(options?) {
      await host('locator.hover', selector, serializeOptions(options));
    },
    async focus(options?) {
      await host('locator.focus', selector, serializeOptions(options));
    },

    // Querying
    async textContent(options?) {
      return host('locator.textContent', selector, serializeOptions(options)) as Promise<string | null>;
    },
    async innerText(options?) {
      return host('locator.innerText', selector, serializeOptions(options)) as Promise<string>;
    },
    async innerHTML(options?) {
      return host('locator.innerHTML', selector, serializeOptions(options)) as Promise<string>;
    },
    async getAttribute(name, options?) {
      return host('locator.getAttribute', selector, name, serializeOptions(options)) as Promise<string | null>;
    },
    async inputValue(options?) {
      return host('locator.inputValue', selector, serializeOptions(options)) as Promise<string>;
    },
    async isVisible(options?) {
      return host('locator.isVisible', selector, serializeOptions(options)) as Promise<boolean>;
    },
    async isChecked(options?) {
      return host('locator.isChecked', selector, serializeOptions(options)) as Promise<boolean>;
    },
    async isEnabled(options?) {
      return host('locator.isEnabled', selector, serializeOptions(options)) as Promise<boolean>;
    },
    async isHidden(options?) {
      return host('locator.isHidden', selector, serializeOptions(options)) as Promise<boolean>;
    },

    // Filtering & chaining
    first() {
      return createLocator(host, `${selector}>>__first`);
    },
    last() {
      return createLocator(host, `${selector}>>__last`);
    },
    nth(index: number) {
      return createLocator(host, `${selector}>>__nth=${index}`);
    },
    async count() {
      return host('locator.count', selector) as Promise<number>;
    },
    locator(childSelector: string) {
      return createLocator(host, `${selector}>>${childSelector}`);
    },
    getByRole(role, options?) {
      return createLocator(host, `${selector}>>role=${role}${options ? '|' + JSON.stringify(options) : ''}`);
    },
    getByText(text, options?) {
      return createLocator(host, `${selector}>>text=${serializeLocatorArg(text)}${options?.exact ? '|exact' : ''}`);
    },
    getByLabel(text, options?) {
      return createLocator(host, `${selector}>>label=${serializeLocatorArg(text)}${options?.exact ? '|exact' : ''}`);
    },
    getByTestId(testId) {
      return createLocator(host, `${selector}>>testid=${serializeLocatorArg(testId)}`);
    },
    filter(options) {
      const filterParts: string[] = [];
      if (options.hasText) filterParts.push(`hasText=${serializeLocatorArg(options.hasText)}`);
      // has: Locator is complex — defer to C# for resolution
      return createLocator(host, `${selector}>>__filter=${JSON.stringify(filterParts)}`);
    },

    // Evaluate
    async evaluate<T>(fnOrExpr: unknown, arg?: unknown): Promise<T> {
      const fnSource = typeof fnOrExpr === 'string' ? fnOrExpr : (fnOrExpr as Function).toString();
      const serializedArg = arg !== undefined ? JSON.stringify(arg) : undefined;
      return host('locator.evaluate', selector, fnSource, serializedArg) as Promise<T>;
    },

    // Screenshot
    async screenshot(options?) {
      return host('locator.screenshot', selector, serializeOptions(options)) as Promise<string>;
    },

    // Waiting
    async waitFor(options?) {
      await host('locator.waitFor', selector, serializeOptions(options));
    },
  };
}

export function createPage(gen?: Gen): Page {
  const host = getHost();

  // Track current URL locally for synchronous access
  let currentUrl = '';

  const page: Page = {
    // ── Navigation ──────────────────────────────────────────────

    async goto(url, options?) {
      const raw = await host('goto', url, serializeOptions(options)) as Record<string, unknown>;
      currentUrl = raw.url as string;
      return {
        url: raw.url as string,
        status: raw.status as number,
        ok: raw.ok as boolean,
      };
    },

    async waitForURL(url, options?) {
      const urlStr = url instanceof RegExp
        ? JSON.stringify({ __regex: url.source, flags: url.flags })
        : url;
      await host('waitForURL', urlStr, serializeOptions(options));
    },

    async goBack(options?) {
      await host('goBack', serializeOptions(options));
    },

    async goForward(options?) {
      await host('goForward', serializeOptions(options));
    },

    async reload(options?) {
      await host('reload', serializeOptions(options));
    },

    // ── Info ────────────────────────────────────────────────────

    async title() {
      return host('title') as Promise<string>;
    },

    url() {
      return currentUrl;
    },

    async content() {
      return host('content') as Promise<string>;
    },

    // ── Element interaction ─────────────────────────────────────

    async click(selector, options?) {
      await host('click', selector, serializeOptions(options));
    },

    async dblclick(selector, options?) {
      await host('dblclick', selector, serializeOptions(options));
    },

    fill(selector: string, valueOrOptions?: string | FillOptions, options?: FillOptions): any {
      // Overload: fill(selector) returns FillWithAction
      if (valueOrOptions === undefined) {
        return {
          async with(data: Record<string, unknown>) {
            await host('fillForm', selector, JSON.stringify(data));
          },
        } satisfies FillWithAction;
      }

      // Standard: fill(selector, value, options?)
      return host('fill', selector, valueOrOptions as string, serializeOptions(options as FillOptions));
    },

    async type(selector, text, options?) {
      await host('type', selector, text, serializeOptions(options));
    },

    async press(selector, key, options?) {
      await host('press', selector, key, serializeOptions(options));
    },

    async check(selector, options?) {
      await host('check', selector, serializeOptions(options));
    },

    async uncheck(selector, options?) {
      await host('uncheck', selector, serializeOptions(options));
    },

    async selectOption(selector, values) {
      return host('selectOption', selector, JSON.stringify(values)) as Promise<string[]>;
    },

    async hover(selector, options?) {
      await host('hover', selector, serializeOptions(options));
    },

    async focus(selector, options?) {
      await host('focus', selector, serializeOptions(options));
    },

    // ── Querying ────────────────────────────────────────────────

    async textContent(selector, options?) {
      return host('textContent', selector, serializeOptions(options)) as Promise<string | null>;
    },

    async innerText(selector, options?) {
      return host('innerText', selector, serializeOptions(options)) as Promise<string>;
    },

    async innerHTML(selector, options?) {
      return host('innerHTML', selector, serializeOptions(options)) as Promise<string>;
    },

    async getAttribute(selector, name, options?) {
      return host('getAttribute', selector, name, serializeOptions(options)) as Promise<string | null>;
    },

    async inputValue(selector, options?) {
      return host('inputValue', selector, serializeOptions(options)) as Promise<string>;
    },

    async isVisible(selector, options?) {
      return host('isVisible', selector, serializeOptions(options)) as Promise<boolean>;
    },

    async isChecked(selector, options?) {
      return host('isChecked', selector, serializeOptions(options)) as Promise<boolean>;
    },

    // ── Waiting ─────────────────────────────────────────────────

    async waitForSelector(selector, options?) {
      await host('waitForSelector', selector, serializeOptions(options));
    },

    async waitForTimeout(timeout) {
      await host('waitForTimeout', timeout);
    },

    async waitForLoadState(state?) {
      await host('waitForLoadState', state ?? 'load');
    },

    // ── Locators ────────────────────────────────────────────────

    getByRole(role, options?) {
      const selector = `role=${role}${options ? '|' + JSON.stringify(options) : ''}`;
      return createLocator(host, selector);
    },

    getByText(text, options?) {
      return createLocator(host, `text=${serializeLocatorArg(text)}${options?.exact ? '|exact' : ''}`);
    },

    getByLabel(text, options?) {
      return createLocator(host, `label=${serializeLocatorArg(text)}${options?.exact ? '|exact' : ''}`);
    },

    getByPlaceholder(text, options?) {
      return createLocator(host, `placeholder=${serializeLocatorArg(text)}${options?.exact ? '|exact' : ''}`);
    },

    getByTestId(testId) {
      return createLocator(host, `testid=${serializeLocatorArg(testId)}`);
    },

    locator(selector) {
      return createLocator(host, selector);
    },

    // ── Evaluate ────────────────────────────────────────────────

    async evaluate<T>(fnOrExpr: unknown, arg?: unknown): Promise<T> {
      const fnSource = typeof fnOrExpr === 'string' ? fnOrExpr : (fnOrExpr as Function).toString();
      const serializedArg = arg !== undefined ? JSON.stringify(arg) : undefined;
      return host('evaluate', fnSource, serializedArg) as Promise<T>;
    },

    // ── Screenshot ──────────────────────────────────────────────

    async screenshot(options?) {
      return host('screenshot', serializeOptions(options)) as Promise<string>;
    },

    // ── Helpers ──────────────────────────────────────────────────

    async autoFill(selector, options?) {
      const seedJson = options?.seedWith ? JSON.stringify(options.seedWith) : undefined;
      // Pass gen suffix so C# can create canary-prefixed random data
      const genSuffix = gen?.suffix;
      await host('autoFill', selector, seedJson, genSuffix);
    },

    async yields<T>(pageClass: PageClass & (new (...args: unknown[]) => T)): Promise<T> {
      // Wait for URL if the page class specifies one
      if (pageClass.url) {
        await page.waitForURL(
          pageClass.url,
          { timeout: 10000 },
        );
      }

      // Validate if the page class provides validation
      if (pageClass.validate) {
        await pageClass.validate(page);
      }

      // Instantiate the page class with this page
      return new pageClass(page);
    },
  };

  return page;
}
