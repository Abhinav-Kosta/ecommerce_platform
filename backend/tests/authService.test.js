jest.mock("../src/models/User", () => ({
  findOne: jest.fn(),
  create: jest.fn(),
}));

jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
}));

const User = require("../src/models/User");
const bcrypt = require("bcryptjs");
const { registerUser } = require("../src/services/authService");

describe("Authentication service - registration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates a user with a hashed password", async () => {
    User.findOne.mockResolvedValue(null);

    bcrypt.hash.mockResolvedValue("hashed-password");

    User.create.mockResolvedValue({
      _id: "user123",
      name: "Alex Customer",
      email: "alex@example.com",
      passwordHash: "hashed-password",
      role: "customer",
      createdAt: new Date("2026-01-01"),
    });

    const result = await registerUser({
      name: "Alex Customer",
      email: "Alex@Example.com",
      password: "SecurePass123",
    });

    expect(User.findOne).toHaveBeenCalledWith({
      email: "alex@example.com",
    });

    expect(bcrypt.hash).toHaveBeenCalledWith(
      "SecurePass123",
      12
    );

    expect(User.create).toHaveBeenCalledWith({
      name: "Alex Customer",
      email: "alex@example.com",
      passwordHash: "hashed-password",
      role: "customer",
    });

    expect(result).toMatchObject({
      id: "user123",
      name: "Alex Customer",
      email: "alex@example.com",
      role: "customer",
    });

    expect(result.passwordHash).toBeUndefined();
  });

  it("rejects an already registered email", async () => {
    User.findOne.mockResolvedValue({
      _id: "existing-user",
    });

    await expect(
      registerUser({
        name: "Alex Customer",
        email: "alex@example.com",
        password: "SecurePass123",
      })
    ).rejects.toMatchObject({
      statusCode: 409,
      message: "Email is already registered",
    });

    expect(bcrypt.hash).not.toHaveBeenCalled();
    expect(User.create).not.toHaveBeenCalled();
  });

  it("handles duplicate email database errors", async () => {
    User.findOne.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue("hashed-password");

    const duplicateError = new Error("Duplicate key");
    duplicateError.code = 11000;

    User.create.mockRejectedValue(duplicateError);

    await expect(
      registerUser({
        name: "Alex Customer",
        email: "alex@example.com",
        password: "SecurePass123",
      })
    ).rejects.toMatchObject({
      statusCode: 409,
      message: "Email is already registered",
    });
  });
});