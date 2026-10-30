jest.mock("../src/services/authService", () => ({
  registerUser: jest.fn(),
}));

const express = require("express");
const request = require("supertest");

const { registerUser } = require("../src/services/authService");
const authRoutes = require("../src/routes/authRoutes");
const errorMiddleware = require("../src/middleware/errorMiddleware");
const notFoundMiddleware = require("../src/middleware/notFoundMiddleware");

const app = express();

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