jest.mock("../src/models/User", () => ({
  findById: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
}));

const express = require("express");
const request = require("supertest");
const cookieParser = require("cookie-parser");

const User = require("../src/models/User");
const jwt = require("jsonwebtoken");

const { protect } = require("../src/middleware/authMiddleware");
const errorMiddleware = require("../src/middleware/errorMiddleware");

describe("Authentication middleware - protect", () => {
  let app;

  const mockUser = {
    _id: "user123",
    name: "Test Customer",
    email: "customer@example.com",
    role: "customer",
    tokenVersion: 0,
  };

  // Mock the Mongoose query chain: findById().select()
  const mockFindUser = (user) => {
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(user),
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();

    app = express();
    app.use(cookieParser());

    app.get("/protected", protect, (req, res) => {
      res.status(200).json({
        success: true,
        user: req.user,
      });
    });

    app.use(errorMiddleware);
  });

  it("should reject requests without an authentication cookie", async () => {
    const response = await request(app).get("/protected");

    expect(response.status).toBe(401);
    expect(jwt.verify).not.toHaveBeenCalled();
    expect(User.findById).not.toHaveBeenCalled();
  });

  it("should reject requests with an invalid JWT", async () => {
    jwt.verify.mockImplementation(() => {
      throw new Error("Invalid token");
    });

    const response = await request(app)
      .get("/protected")
      .set("Cookie", "token=invalid-token");

    expect(response.status).toBe(401);
    expect(jwt.verify).toHaveBeenCalledWith(
      "invalid-token",
      process.env.JWT_SECRET
    );
    expect(User.findById).not.toHaveBeenCalled();
  });

  it("should reject requests with an expired JWT", async () => {
    const expiredError = new Error("Token expired");
    expiredError.name = "TokenExpiredError";

    jwt.verify.mockImplementation(() => {
      throw expiredError;
    });

    const response = await request(app)
      .get("/protected")
      .set("Cookie", "token=expired-token");

    expect(response.status).toBe(401);
    expect(User.findById).not.toHaveBeenCalled();
  });

  it("should reject requests when the user no longer exists", async () => {
    jwt.verify.mockReturnValue({
      id: "deleted-user",
      tokenVersion: 0,
    });

    mockFindUser(null);

    const response = await request(app)
      .get("/protected")
      .set("Cookie", "token=valid-token");

    expect(response.status).toBe(401);
    expect(User.findById).toHaveBeenCalledWith("deleted-user");
  });

  it("should authenticate a user with a valid JWT and matching token version", async () => {
    jwt.verify.mockReturnValue({
      id: "user123",
      tokenVersion: 0,
    });

    mockFindUser(mockUser);

    const response = await request(app)
      .get("/protected")
      .set("Cookie", "token=valid-token");

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      success: true,
      user: {
        _id: "user123",
        id: "user123",
        name: "Test Customer",
        email: "customer@example.com",
        role: "customer",
      },
    });

    expect(jwt.verify).toHaveBeenCalledWith(
      "valid-token",
      process.env.JWT_SECRET
    );

    expect(User.findById).toHaveBeenCalledWith("user123");
  });

  it("should reject a session when token versions do not match", async () => {
    jwt.verify.mockReturnValue({
      id: "user123",
      tokenVersion: 0,
    });

    mockFindUser({
      ...mockUser,
      tokenVersion: 1,
    });

    const response = await request(app)
      .get("/protected")
      .set("Cookie", "token=old-token");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(
      "Your session is no longer valid. Please log in again."
    );
  });

  it("should forward database errors to error middleware", async () => {
    jwt.verify.mockReturnValue({
      id: "user123",
      tokenVersion: 0,
    });

    User.findById.mockReturnValue({
      select: jest.fn().mockRejectedValue(
        new Error("Database connection failed")
      ),
    });

    const response = await request(app)
      .get("/protected")
      .set("Cookie", "token=valid-token");

    expect(response.status).toBe(500);
  });
});