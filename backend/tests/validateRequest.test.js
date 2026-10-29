
const express = require("express");
const request = require("supertest");
const validateRequest = require("../src/middleware/validateRequest");
const errorMiddleware = require("../src/middleware/errorMiddleware");
const {
  paginationQuerySchema,
} = require("../src/validators/commonValidators");

describe("Joi validation middleware", () => {
  const testApp = express();

  testApp.get(
    "/pagination",
    validateRequest(paginationQuerySchema, "query"),
    (req, res) => {
      res.status(200).json({
        success: true,
        data: req.validated.query,
      });
    }
  );

  testApp.use(errorMiddleware);

  it("accepts valid pagination parameters", async () => {
    const response = await request(testApp)
      .get("/pagination?page=2&limit=24");

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual({
      page: 2,
      limit: 24,
    });
  });

  it("applies pagination defaults", async () => {
    const response = await request(testApp).get("/pagination");

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual({
      page: 1,
      limit: 12,
    });
  });

  it("rejects invalid pagination parameters", async () => {
    const response = await request(testApp)
      .get("/pagination?page=0&limit=500");

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.status).toBe("fail");
    expect(response.body.message).toBeTruthy();
  });
});