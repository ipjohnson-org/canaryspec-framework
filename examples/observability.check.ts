check("metrics and annotations", async ({ metric, annotate, expect }) => {
  metric("queue_depth", 42);
  metric("latency_ms", 150, { unit: "ms" });
  annotate("requestId", "req-abc-123");
  expect(true).toBeTruthy();
});

check("gen produces canary-prefixed values", async ({ gen, expect, annotate }) => {
  const id = gen.id("recipe");
  const email = gen.email("test");

  expect(id).toContain("canary-recipe-");
  expect(email).toContain("@canaryspec.local");
  expect(gen.timestamp).toBeGreaterThan(0);

  annotate("generatedId", id);
  annotate("generatedEmail", email);
});

check("degrade signals yellow status", async ({ degrade }) => {
  degrade("latency is elevated");
});
