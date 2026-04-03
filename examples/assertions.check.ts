check("expect matchers", async ({ expect }) => {
  // Equality
  expect("hello").toBe("hello");
  expect(null).toBeNull();
  expect(undefined).toBeUndefined();

  // Comparisons
  expect(10).toBeGreaterThan(5);
  expect(3).toBeLessThan(10);

  // Pattern matching
  expect("user@example.com").toMatch(/^[^@]+@[^@]+\.[^@]+$/);
  expect("canaryspec").toMatch("canary");

  // Object inspection
  expect({ name: "Alice", role: "admin" }).toHaveProperty("name");
  expect({ status: 200 }).toHaveProperty("status", 200);

  // Partial deep equality
  expect({ user: { id: "123", name: "Alice" }, status: "ok" })
    .toMatchObject({ user: { id: "123" } });

  // Exception checking
  expect(() => { throw new Error("boom"); }).toThrow("boom");
  expect(() => "safe").not.toThrow();
});

check("assert imperative style", async ({ assert }) => {
  assert.equal(1, 1);
  assert.notEqual(1, 2);
  assert.ok(true);
  assert.greaterThan(10, 5);
  assert.lessThan(5, 10);
  assert.contains([1, 2, 3], 2);
});
