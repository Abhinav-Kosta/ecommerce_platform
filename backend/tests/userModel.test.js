const User = require("../src/models/User");

describe("User model", () => {
  const validUser = {
    name: "Alex Customer",
    email: "Alex@Example.com",
    passwordHash: "test-hash-not-a-real-password",
  };

  it("normalizes email and defaults role to customer", async () => {
    const user = new User(validUser);

    await user.validate();

    expect(user.email).toBe("alex@example.com");
    expect(user.role).toBe("customer");
    expect(user.createdAt).toBeUndefined();
  });

  it("rejects a missing password hash", async () => {
    const user = new User({
      name: "Alex Customer",
      email: "alex@example.com",
    });

    await expect(user.validate()).rejects.toMatchObject({
      name: "ValidationError",
    });
  });

  it("rejects unsupported roles", async () => {
    const user = new User({
      ...validUser,
      role: "superadmin",
    });

    await expect(user.validate()).rejects.toMatchObject({
      name: "ValidationError",
    });
  });

  it("excludes passwordHash from normal query selection", () => {
    expect(User.schema.path("passwordHash").options.select).toBe(false);
  });
});

describe("User tokenVersion", () => {
  test("should default tokenVersion to 0", () => {
    const user = new User({
      name: "Test User",
      email: "test@example.com",
      passwordHash: "hashed-password",
    });

    expect(user.tokenVersion).toBe(0);
  });

  test("should accept a custom tokenVersion", () => {
    const user = new User({
      name: "Test User",
      email: "test@example.com",
      passwordHash: "hashed-password",
      tokenVersion: 2,
    });

    expect(user.tokenVersion).toBe(2);
  });
});