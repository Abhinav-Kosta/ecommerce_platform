const express = require("express");
const request = require("supertest");
const { restrictTo } = require("../src/middleware/roleMiddleware");
const errorMiddleware = require("../src/middleware/errorMiddleware");

const createTestApp = (user, allowedRoles) => {
  const app = express();

  app.get(
    "/protected",
    (req, res, next) => {
      req.user = user;
      next();
    },
    restrictTo(...allowedRoles),
    (req, res) => {
      res.status(200).json({ success: true });
    }
  );

  app.use(errorMiddleware);

  return app;
};

describe("Role Middleware", () => {
  test("should deny access to a customer on an admin-only route", async () => {
    const app = createTestApp(
      { id: "user123", role: "customer" },
      ["admin"]
    );

    const response = await request(app).get("/protected");

    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      "You do not have permission to perform this action"
    );
  });

  test("should allow access to an admin on an admin-only route", async () => {
    const app = createTestApp(
      { id: "admin123", role: "admin" },
      ["admin"]
    );

    const response = await request(app).get("/protected");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  test("should deny access when req.user is missing", async () => {
    const app = createTestApp(undefined, ["admin"]);

    const response = await request(app).get("/protected");

    expect(response.status).toBe(403);
  });

  test("should allow access when the user's role is in the allowed roles", async () => {
    const app = createTestApp(
      { id: "user123", role: "customer" },
      ["customer", "admin"]
    );

    const response = await request(app).get("/protected");

    expect(response.status).toBe(200);
  });
});