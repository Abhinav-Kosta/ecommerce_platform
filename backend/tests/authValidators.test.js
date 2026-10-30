const { registerSchema } = require("../src/validators/authValidators");

describe("Registration validation schema", () => {
  it("accepts valid registration data", () => {
    const result = registerSchema.validate({
      name: "Alex Customer",
      email: "Alex@Example.com",
      password: "SecurePass123",
    });

    expect(result.error).toBeUndefined();
    expect(result.value.email).toBe("alex@example.com");
  });

  it("rejects an invalid email", () => {
    const result = registerSchema.validate({
      name: "Alex Customer",
      email: "invalid-email",
      password: "SecurePass123",
    });

    expect(result.error).toBeDefined();
  });

  it("rejects passwords shorter than 8 characters", () => {
    const result = registerSchema.validate({
      name: "Alex Customer",
      email: "alex@example.com",
      password: "short",
    });

    expect(result.error).toBeDefined();
  });

  it("rejects a client-provided admin role", () => {
    const result = registerSchema.validate({
      name: "Alex Customer",
      email: "alex@example.com",
      password: "SecurePass123",
      role: "admin",
    });

    expect(result.error).toBeDefined();
  });

  it("rejects missing required fields", () => {
    const result = registerSchema.validate({});

    expect(result.error).toBeDefined();
    expect(result.error.details.length).toBeGreaterThan(0);
  });
});