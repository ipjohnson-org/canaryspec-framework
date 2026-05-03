import type { CanaryContext, CheckOptions, FixtureDefinitions } from './types.js';

type CheckBody = (ctx: CanaryContext) => Promise<void>;
type RegisterFn = (name: string, options: CheckOptions | null, body: CheckBody) => void;

export function createExtendedCheck(
  parentFixtures: FixtureDefinitions,
  register: RegisterFn,
): ExtendedCheckFn {
  function extendedCheck(
    name: string,
    optionsOrFn: CheckOptions | CheckBody,
    maybeFn?: CheckBody,
  ) {
    let options: CheckOptions | null;
    let fn: CheckBody;

    if (typeof optionsOrFn === 'function') {
      options = null;
      fn = optionsOrFn;
    } else {
      options = optionsOrFn;
      fn = maybeFn!;
    }

    register(name, options, async (ctx: CanaryContext) => {
      const fixtureValues: Record<string, unknown> = {};
      const teardownResolvers: Array<() => void> = [];
      const factoryPromises: Array<Promise<void>> = [];

      const fixtureNames = Object.keys(parentFixtures);

      // Run each fixture setup sequentially
      for (const fixtureName of fixtureNames) {
        const fixtureDef = parentFixtures[fixtureName];

        const factory = Array.isArray(fixtureDef) ? fixtureDef[0] : fixtureDef;

        // Build context with globals + previously resolved fixtures
        const fixtureCtx = { ...ctx, ...fixtureValues } as CanaryContext;

        // Promise gate: value resolves when use() called, teardown resolves when body done
        let valueResolve!: (value: unknown) => void;
        let valueReject!: (reason: unknown) => void;
        let useWasCalled = false;
        const valuePromise = new Promise<unknown>((resolve, reject) => {
          valueResolve = resolve;
          valueReject = reject;
        });

        let teardownSignal!: () => void;
        const teardownGate = new Promise<void>(resolve => {
          teardownSignal = resolve;
        });

        // Start factory — it calls use(value) then awaits teardown gate.
        // If the factory throws or returns before calling use(), reject valuePromise
        // so the awaiter sees the error instead of hanging forever.
        const factoryPromise = (async () => {
          try {
            await factory(fixtureCtx, async (value: unknown) => {
              useWasCalled = true;
              valueResolve(value);
              await teardownGate;
            });
            if (!useWasCalled) {
              valueReject(new Error(`Fixture '${fixtureName}' completed without calling use()`));
            }
          } catch (e) {
            if (!useWasCalled) {
              // Error is already surfaced via valuePromise; don't rethrow to avoid
              // an unhandled rejection on the unawaited factoryPromise.
              valueReject(e);
              return;
            }
            throw e;
          }
        })();

        // Wait for setup to complete
        const value = await valuePromise;
        fixtureValues[fixtureName] = value;

        teardownResolvers.push(teardownSignal);
        factoryPromises.push(factoryPromise);
      }

      // Build check context with all fixture values
      const checkCtx = { ...ctx, ...fixtureValues } as CanaryContext;

      // Run the check body
      let checkError: unknown = null;
      try {
        await fn(checkCtx);
      } catch (e) {
        checkError = e;
      }

      // Signal teardowns in reverse order and wait for them
      for (let j = teardownResolvers.length - 1; j >= 0; j--) {
        try {
          teardownResolvers[j]();
          await factoryPromises[j];
        } catch (e) {
          if (!checkError) checkError = e;
        }
      }

      if (checkError) throw checkError;
    });
  }

  extendedCheck.extend = function (newFixtures: FixtureDefinitions): ExtendedCheckFn {
    const merged: FixtureDefinitions = { ...parentFixtures, ...newFixtures };
    return createExtendedCheck(merged, register);
  };

  return extendedCheck as ExtendedCheckFn;
}

export interface ExtendedCheckFn {
  (name: string, fn: CheckBody): void;
  (name: string, options: CheckOptions, fn: CheckBody): void;
  extend(fixtures: FixtureDefinitions): ExtendedCheckFn;
}
