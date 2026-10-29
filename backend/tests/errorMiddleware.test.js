const express = require("express");
const request = require("supertest");
const errorMiddleware = require("../src/middleware/errorMiddleware");

describe("Centralized error middleware", () => {
  it("returns a safe 500 response for unexpected errors", async () => {
    const testApp = express();

    testApp.get("/test-error", (req, res, next) => {
      next(new Error("Sensitive internal database details"));
    });

    testApp.use(errorMiddleware);

    const response = await request(testApp)
      .get("/test-error");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      status: "error",
      message: "Internal server error",
    });

    expect(JSON.stringify(response.body))
      .not.toContain("Sensitive internal database details");
  });
});