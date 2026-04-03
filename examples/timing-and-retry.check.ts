check("time measures duration", async ({ time, expect }) => {
  const { result, duration } = await time("compute", async () => {
    return 42;
  });
  expect(result).toBe(42);
  expect(duration).toBeGreaterThan(-1);
});

check("time with thresholds", async ({ time }) => {
  await time("fast-op", { warn: "5s", fail: "10s" }, async () => {
    return "done";
  });
});

check("retry succeeds after failures", async ({ retry, expect }) => {
  let attempts = 0;
  const result = await retry({ attempts: 5, delay: "10ms" }, async () => {
    attempts++;
    if (attempts < 3) throw new Error("not yet");
    return "ok";
  });
  expect(result).toBe("ok");
  expect(attempts).toBe(3);
});

check("retry with until predicate", async ({ retry, expect }) => {
  let counter = 0;
  const value = await retry(
    { attempts: 10, delay: "10ms", until: (v: number) => v >= 5 },
    async () => ++counter,
  );
  expect(value).toBeGreaterThan(4);
});
