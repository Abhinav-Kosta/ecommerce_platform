jest.mock("../src/services/authService", () => ({
  registerUser: jest.fn(),
  loginUser: jest.fn(),
  changePassword: jest.fn(),
}));

jest.mock("../src/utils/tokenUtils", () => ({
  generateToken: jest.fn(),
}));

jest.mock("../src/utils/cookieUtils", () => ({
  setAuthCookie: jest.fn(),
  clearAuthCookie: jest.fn(),
}));

jest.mock("../src/middleware/authMiddleware", () => ({
  protect: (req, res, next) => next(),
}));

const express = require("express");
const request = require("supertest");

const { 
  registerUser, 
  loginUser,
  changePassword,
} = require("../src/services/authService");

const { generateToken } = require("../src/utils/tokenUtils");
const { setAuthCookie, clearAuthCookie } = require("../src/utils/cookieUtils");

const {
  register,
  login,
  logout,
  getMe,
  updatePassword,
} = require("../src/controllers/authController");

const authRoutes = require("../src/routes/authRoutes");

const validateRequest = require("../src/middleware/validateRequest");
const { registerSchema, loginSchema, changePasswordSchema } = require("../src/validators/authValidators");
const asyncHandler = require("../src/utils/asyncHandler");

const AppError = require("../src/utils/AppError");

const errorMiddleware = require("../src/middleware/errorMiddleware");
const notFoundMiddleware = require("../src/middleware/notFoundMiddleware");

const app = express();

const createTestApp = () => {
  const app = express();

  app.use(express.json());

  app.post(
    "/register",
    validateRequest(registerSchema, "body"),
    asyncHandler(register)
  );

  app.post(
    "/login",
    validateRequest(loginSchema, "body"),
    asyncHandler(login)
  );

  app.patch(
    "/change-password",
    (req, res, next) => {
      req.user = { _id: "user123" };
      next();
    },
    validateRequest(changePasswordSchema, "body"),
    asyncHandler(updatePassword)
  );

  app.post(
    "/logout",
    asyncHandler(logout)
  );

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
};

app.use(express.json());
app.use("/api/v1/auth", authRoutes);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

describe("POST /api/v1/auth/register", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("registers a valid user", async () => {
    registerUser.mockResolvedValue({
      id: "user123",
      name: "Alex Customer",
      email: "alex@example.com",
      role: "customer",
    });

    const response = await request(app)
      .post("/api/v1/auth/register")
      .send({
        name: "Alex Customer",
        email: "Alex@Example.com",
        password: "SecurePass123",
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe("alex@example.com");
    expect(response.body.data.user.role).toBe("customer");

    expect(registerUser).toHaveBeenCalledWith({
      name: "Alex Customer",
      email: "alex@example.com",
      password: "SecurePass123",
    });
  });

  it("rejects invalid registration data", async () => {
    const response = await request(app)
      .post("/api/v1/auth/register")
      .send({
        name: "A",
        email: "invalid-email",
        password: "123",
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(registerUser).not.toHaveBeenCalled();
  });

  it("rejects a client-provided role", async () => {
    const response = await request(app)
      .post("/api/v1/auth/register")
      .send({
        name: "Alex Customer",
        email: "alex@example.com",
        password: "SecurePass123",
        role: "admin",
      });

    expect(response.status).toBe(400);
    expect(registerUser).not.toHaveBeenCalled();
  });
});


describe("Authentication controller - login", () => {
  let app;

  const mockUser = {
    id: "user123",
    name: "Test Customer",
    email: "customer@example.com",
    role: "customer",
    tokenVersion: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    app = createTestApp();
  });

  it("logs in successfully and returns HTTP 200", async () => {
    loginUser.mockResolvedValue(mockUser);
    generateToken.mockReturnValue("mock-jwt-token");

    const response = await request(app)
      .post("/login")
      .send({
        email: "customer@example.com",
        password: "SecurePass123",
      });

    expect(response.status).toBe(200);

    expect(response.body).toMatchObject({
      success: true,
      message: "Login successful",
      data: {
        user: mockUser,
      },
    });
  });

  it("generates a JWT using the logged-in user's ID", async () => {
    loginUser.mockResolvedValue(mockUser);
    generateToken.mockReturnValue("mock-jwt-token");

    await request(app)
      .post("/login")
      .send({
        email: "customer@example.com",
        password: "SecurePass123",
      });

    expect(generateToken).toHaveBeenCalledWith("user123", 0);
  });

  it("sets the authentication cookie with the generated token", async () => {
    loginUser.mockResolvedValue(mockUser);
    generateToken.mockReturnValue("mock-jwt-token");

    await request(app)
      .post("/login")
      .send({
        email: "customer@example.com",
        password: "SecurePass123",
      });

    expect(setAuthCookie).toHaveBeenCalledWith(
      expect.any(Object),
      "mock-jwt-token"
    );
  });

  it("does not return the JWT or password hash in the response body", async () => {
    loginUser.mockResolvedValue(mockUser);
    generateToken.mockReturnValue("mock-jwt-token");

    const response = await request(app)
      .post("/login")
      .send({
        email: "customer@example.com",
        password: "SecurePass123",
      });

    expect(response.body.data.user).not.toHaveProperty("passwordHash");
    expect(response.body.data.user).not.toHaveProperty("password");
    expect(response.body.data).not.toHaveProperty("token");
  });

  it("returns HTTP 401 when credentials are invalid", async () => {
    loginUser.mockRejectedValue(
      new AppError("Invalid email or password", 401)
    );

    const response = await request(app)
      .post("/login")
      .send({
        email: "customer@example.com",
        password: "WrongPassword123",
      });

    expect(response.status).toBe(401);

    expect(response.body).toMatchObject({
      success: false,
      message: "Invalid email or password",
    });

    expect(generateToken).not.toHaveBeenCalled();
    expect(setAuthCookie).not.toHaveBeenCalled();
  });

  it("returns HTTP 400 when login validation fails", async () => {
    const response = await request(app)
      .post("/login")
      .send({
        email: "invalid-email",
        password: "SecurePass123",
      });

    expect(response.status).toBe(400);
    expect(loginUser).not.toHaveBeenCalled();
    expect(generateToken).not.toHaveBeenCalled();
    expect(setAuthCookie).not.toHaveBeenCalled();
  });
});

describe("getMe", () => {
  test("should return the authenticated user's profile", async () => {
    const user = {
      _id: "user123",
      name: "Test User",
      email: "test@example.com",
      role: "customer",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      passwordHash: "this-should-not-be-returned",
    };

    const app = express();

    app.get(
      "/me",
      (req, res, next) => {
        req.user = user;
        next();
      },
      asyncHandler(getMe)
    );

    app.use(errorMiddleware);

    const response = await request(app).get("/me");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user).toEqual({
      id: "user123",
      name: "Test User",
      email: "test@example.com",
      role: "customer",
      createdAt: user.createdAt.toISOString(),
    });

    expect(response.body.data.user.passwordHash).toBeUndefined();
  });
});

describe("Authentication controller - logout", () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = createTestApp();
  });

  it("logs out successfully and returns HTTP 200", async () => {
    const response = await request(app)
      .post("/logout");

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      success: true,
      message: "Logout successful",
    });
  });

  it("clears the authentication cookie", async () => {
    await request(app)
      .post("/logout");

    expect(clearAuthCookie).toHaveBeenCalledTimes(1);
    expect(clearAuthCookie).toHaveBeenCalledWith(
      expect.any(Object)
    );
  });

  it("does not generate a new JWT during logout", async () => {
    await request(app)
      .post("/logout");

    expect(generateToken).not.toHaveBeenCalled();
    expect(setAuthCookie).not.toHaveBeenCalled();
  });
});

describe("PATCH /change-password", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should change the password successfully", async () => {
    changePassword.mockResolvedValue({
      message: "Password changed successfully",
    });

    const response = await request(createTestApp())
      .patch("/change-password")
      .send({
        currentPassword: "OldPassword123",
        newPassword: "NewPassword123",
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: "Password changed successfully",
    });

    expect(changePassword).toHaveBeenCalledWith(
      "user123",
      "OldPassword123",
      "NewPassword123"
    );
  });

  it("should reject invalid password data", async () => {
    const response = await request(createTestApp())
      .patch("/change-password")
      .send({
        currentPassword: "OldPassword123",
        newPassword: "short",
      });

    expect(response.status).toBe(400);
    expect(changePassword).not.toHaveBeenCalled();
  });

  it("should return an error when the current password is incorrect", async () => {
    changePassword.mockRejectedValue(
      new AppError("Current password is incorrect", 401)
    );

    const response = await request(createTestApp())
      .patch("/change-password")
      .send({
        currentPassword: "WrongPassword123",
        newPassword: "NewPassword123",
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(
      "Current password is incorrect"
    );
  });
});