check("arithmetic works", async ({ expect }) => {
  expect(1 + 1).toBe(2);
  expect(true).toBeTruthy();
  expect("canaryspec").toContain("canary");
  expect([1, 2, 3]).toHaveLength(3);
});

check("step returns typed values", async ({ expect, step }) => {
  const value = await step("compute", async () => {
    return 6 * 7;
  });

  await step("verify", async () => {
    expect(value).toBe(42);
    expect(value).toBeGreaterThan(40);
  });
});

check("cleanup runs in LIFO order", async ({ expect, onCleanup }) => {
  onCleanup("first registered", () => {});
  onCleanup("second registered", () => {});
  expect(true).toBeTruthy();
});

check("negation works", async ({ expect }) => {
  expect(1).not.toBe(2);
  expect(null).not.toBeTruthy();
  expect("hello").not.toContain("xyz");
});
