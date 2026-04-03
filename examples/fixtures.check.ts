// Basic fixture
const withCounter = check.extend({
  counter: async ({}, use) => {
    await use(42);
  },
});

withCounter("fixture provides value", async ({ expect, counter }) => {
  expect(counter).toBe(42);
});

// Fixture with setup and teardown
const withResource = check.extend({
  resource: async ({}, use) => {
    const items: string[] = ["created"];
    await use(items);
    items.push("cleaned-up"); // teardown
  },
});

withResource("fixture teardown runs after body", async ({ expect, resource }) => {
  expect(resource).toHaveLength(1);
  expect(resource).toContain("created");
});

// Chained fixtures
const withName = withCounter.extend({
  name: async ({}, use) => {
    await use("canary");
  },
});

withName("chained fixtures", async ({ expect, counter, name }) => {
  expect(counter).toBe(42);
  expect(name).toBe("canary");
});

// Fixture dependencies
const withDerived = check.extend({
  base: async ({}, use) => { await use(10); },
  doubled: async ({ base }, use) => { await use((base as number) * 2); },
});

withDerived("fixture dependencies resolve", async ({ expect, base, doubled }) => {
  expect(base).toBe(10);
  expect(doubled).toBe(20);
});
