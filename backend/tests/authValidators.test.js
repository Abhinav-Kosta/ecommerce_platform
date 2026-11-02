const { registerSchema, loginSchema, changePasswordSchema } = require("../src/validators/authValidators");

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

describe("loginSchema", () => {
  test("should accept valid email and password", () => {
    const input = {
      email: "customer@example.com",
      password: "SecurePass123",
    };

    const { error, value } = loginSchema.validate(input);

    expect(error).toBeUndefined();
    expect(value.email).toBe("customer@example.com");
    expect(value.password).toBe("SecurePass123");
  });

  test("should normalize email to lowercase and trim whitespace", () => {
    const input = {
      email: "  CUSTOMER@EXAMPLE.COM  ",
      password: "SecurePass123",
    };

    const { error, value } = loginSchema.validate(input);

    expect(error).toBeUndefined();
    expect(value.email).toBe("customer@example.com");
  });

  test("should reject an invalid email", () => {
    const input = {
      email: "not-an-email",
      password: "SecurePass123",
    };

    const { error } = loginSchema.validate(input);

    expect(error).toBeDefined();
    expect(error.details[0].path).toEqual(["email"]);
  });

  test("should reject a missing email", () => {
    const input = {
      password: "SecurePass123",
    };

    const { error } = loginSchema.validate(input);

    expect(error).toBeDefined();
    expect(error.details[0].path).toEqual(["email"]);
  });

  test("should reject a missing password", () => {
    const input = {
      email: "customer@example.com",
    };

    const { error } = loginSchema.validate(input);

    expect(error).toBeDefined();
    expect(error.details[0].path).toEqual(["password"]);
  });

  test("should reject an empty password", () => {
    const input = {
      email: "customer@example.com",
      password: "",
    };

    const { error } = loginSchema.validate(input);

    expect(error).toBeDefined();
    expect(error.details[0].path).toEqual(["password"]);
  });

  test("should reject an unexpected role field", () => {
    const input = {
      email: "customer@example.com",
      password: "SecurePass123",
      role: "admin",
    };

    const { error } = loginSchema.validate(input);

    expect(error).toBeDefined();
    expect(error.details[0].path).toEqual(["role"]);
  });
});

describe("Change Password Validation", () => {
  test("should accept valid current and new passwords", () => {
    const result = changePasswordSchema.validate({
      currentPassword: "OldPassword123",
      newPassword: "NewPassword123",
    });

    expect(result.error).toBeUndefined();
  });

  test("should reject a missing current password", () => {
    const result = changePasswordSchema.validate({
      newPassword: "NewPassword123",
    });

    expect(result.error).toBeDefined();
  });

  test("should reject a missing new password", () => {
    const result = changePasswordSchema.validate({
      currentPassword: "OldPassword123",
    });

    expect(result.error).toBeDefined();
  });

  test("should reject a new password shorter than 8 characters", () => {
    const result = changePasswordSchema.validate({
      currentPassword: "OldPassword123",
      newPassword: "Short1",
    });

    expect(result.error).toBeDefined();
  });

  test("should reject unexpected fields", () => {
    const result = changePasswordSchema.validate({
      currentPassword: "OldPassword123",
      newPassword: "NewPassword123",
      role: "admin",
    });

    expect(result.error).toBeDefined();
  });
});