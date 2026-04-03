// Schema validation with Zod (replaces superstruct)
//
// `z` is available globally — no imports needed.

const UserSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  email: z.string().email(),
  isActive: z.boolean(),
  createdAt: z.string(),
});

check("validate user response", async ({ fetch, expect, step }) => {
  const user = await step("fetch user", async () => {
    const res = await fetch("/api/v1/users/me");
    expect(res.status).toBe(200);
    return await res.json();
  });

  await step("validate schema", async () => {
    const result = UserSchema.safeParse(user);
    expect(result.success).toBeTruthy();
  });

  await step("check profile data", async () => {
    expect(user.isActive).toBe(true);
    const created = dayjs(user.createdAt);
    expect(created.isValid()).toBeTruthy();
    expect(created.year()).toBeGreaterThan(2025);
  });
});

// Zod with partial matching — validate shape then spot-check values
const ProfileSchema = z.object({
  user: z.object({
    id: z.string(),
    displayName: z.string(),
  }),
  settings: z.object({
    theme: z.enum(["light", "dark"]),
    notifications: z.boolean(),
  }),
});

check("validate nested response", async ({ expect }) => {
  const data = {
    user: { id: "u1", displayName: "Alice", avatar: "pic.png" },
    settings: { theme: "dark", notifications: true, language: "en" },
  };

  // Zod parse validates the schema (extra keys are stripped by default)
  const parsed = ProfileSchema.parse(data);
  expect(parsed.user.displayName).toBe("Alice");
  expect(parsed.settings.theme).toBe("dark");

  // toMatchObject for quick spot-checks without a schema
  expect(data).toMatchObject({
    user: { id: "u1" },
    settings: { notifications: true },
  });
});
