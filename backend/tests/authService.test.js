jest.mock("../src/models/User", () => ({
  findOne: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
}));

jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

const User = require("../src/models/User");
const bcrypt = require("bcryptjs");
const AppError = require("../src/utils/AppError");
const { registerUser, loginUser, changePassword } = require("../src/services/authService");

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

describe("loginUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should successfully log in a user with valid credentials", async () => {
    const mockUser = {
      _id: "user123",
      name: "Test Customer",
      email: "customer@example.com",
      role: "customer",
      tokenVersion: 2,
      passwordHash: "hashedPassword",
    };

    const selectMock = jest.fn().mockResolvedValue(mockUser);

    User.findOne.mockReturnValue({
      select: selectMock,
    });

    bcrypt.compare.mockResolvedValue(true);

    const result = await loginUser({
      email: "customer@example.com",
      password: "SecurePass123",
    });

    expect(User.findOne).toHaveBeenCalledWith({
      email: "customer@example.com",
    });

    expect(selectMock).toHaveBeenCalledWith("+passwordHash +tokenVersion");

    expect(bcrypt.compare).toHaveBeenCalledWith(
      "SecurePass123",
      "hashedPassword"
    );

    expect(result).toEqual({
      id: "user123",
      name: "Test Customer",
      email: "customer@example.com",
      role: "customer",
      tokenVersion: 2,
    });
  });

  test("should reject login when the password is incorrect", async () => {
    const mockUser = {
      _id: "user123",
      name: "Test Customer",
      email: "customer@example.com",
      role: "customer",
      tokenVersion: 2,      
      passwordHash: "hashedPassword",
    };

    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser),
    });

    bcrypt.compare.mockResolvedValue(false);

    await expect(
      loginUser({
        email: "customer@example.com",
        password: "WrongPassword123",
      })
    ).rejects.toMatchObject({
      message: "Invalid email or password",
      statusCode: 401,
    });

    expect(bcrypt.compare).toHaveBeenCalledWith(
      "WrongPassword123",
      "hashedPassword"
    );
  });

  test("should reject login when the user does not exist", async () => {
    const selectMock = jest.fn().mockResolvedValue(null);

    User.findOne.mockReturnValue({
      select: selectMock,
    });

    await expect(
      loginUser({
        email: "unknown@example.com",
        password: "SecurePass123",
      })
    ).rejects.toMatchObject({
      message: "Invalid email or password",
      statusCode: 401,
    });

    expect(bcrypt.compare).not.toHaveBeenCalled();
  });

  test("should not return passwordHash in the user object", async () => {
    const mockUser = {
      _id: "user123",
      name: "Test Customer",
      email: "customer@example.com",
      role: "customer",
      tokenVersion: 2,      
      passwordHash: "hashedPassword",
    };

    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser),
    });

    bcrypt.compare.mockResolvedValue(true);

    const result = await loginUser({
      email: "customer@example.com",
      password: "SecurePass123",
    });

    expect(result).not.toHaveProperty("passwordHash");
    expect(Object.keys(result)).toEqual([
      "id",
      "name",
      "email",
      "role",
      "tokenVersion"
    ]);
  });
});

describe("changePassword", () => {
  let mockUser;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUser = {
      passwordHash: "old-hashed-password",
      tokenVersion: 0,
      save: jest.fn().mockResolvedValue(true),
    };
  });

  test("should change the password successfully", async () => {
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser),
    });

    bcrypt.compare.mockResolvedValue(true);
    bcrypt.hash.mockResolvedValue("new-hashed-password");

    const result = await changePassword(
      "user123",
      "OldPassword123",
      "NewPassword123"
    );

    expect(bcrypt.compare).toHaveBeenCalledWith(
      "OldPassword123",
      "old-hashed-password"
    );

    expect(bcrypt.hash).toHaveBeenCalledWith(
      "NewPassword123",
      12
    );

    expect(mockUser.passwordHash).toBe("new-hashed-password");
    expect(mockUser.tokenVersion).toBe(1);
    expect(mockUser.save).toHaveBeenCalledTimes(1);

    expect(result).toEqual({
      message: "Password changed successfully",
    });
  });

  test("should reject when the user does not exist", async () => {
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(null),
    });

    await expect(
      changePassword("user123", "OldPassword123", "NewPassword123")
    ).rejects.toMatchObject({
      statusCode: 404,
      message: "User not found",
    });

    expect(bcrypt.compare).not.toHaveBeenCalled();
  });

  test("should reject an incorrect current password", async () => {
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser),
    });

    bcrypt.compare.mockResolvedValue(false);

    await expect(
      changePassword("user123", "WrongPassword123", "NewPassword123")
    ).rejects.toMatchObject({
      statusCode: 401,
      message: "Current password is incorrect",
    });

    expect(bcrypt.hash).not.toHaveBeenCalled();
    expect(mockUser.tokenVersion).toBe(0);
    expect(mockUser.save).not.toHaveBeenCalled();
  });
});