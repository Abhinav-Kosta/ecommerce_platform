jest.mock("../src/services/authService", () => ({
  registerUser: jest.fn(),
  loginUser: jest.fn(),
}));

jest.mock("../src/utils/tokenUtils", () => ({
  generateToken: jest.fn(),
}));

jest.mock("../src/utils/cookieUtils", () => ({
  setAuthCookie: jest.fn(),
  clearAuthCookie: jest.fn(),
}));

const express = require("express");
const request = require("supertest");

const { registerUser, loginUser } = require("../src/services/authService");

const { generateToken } = require("../src/utils/tokenUtils");
const { setAuthCookie, clearAuthCookie } = require("../src/utils/cookieUtils");

const {
  register,
  login,
  logout,
} = require("../src/controllers/authController");

const authRoutes = require("../src/routes/authRoutes");

const validateRequest = require("../src/middleware/validateRequest");
const { registerSchema, loginSchema } = require("../src/validators/authValidators");
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

    expect(generateToken).toHaveBeenCalledWith("user123");
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