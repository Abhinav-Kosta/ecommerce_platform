
const request = require("supertest");
const app = require("../src/app");

describe("API integration tests", () => {
  describe("GET /api/v1/health", () => {
    it("returns 200 when the API is running", async () => {
      const response = await request(app).get("/api/v1/health");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: "E-commerce API is running",
      });
    });
  });

  describe("Unknown routes", () => {
    it("returns a consistent JSON 404 response", async () => {
      const response = await request(app).get(
        "/api/v1/does-not-exist"
      );

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.status).toBe("fail");
      expect(response.body.message).toContain("Route not found");
    });
  });
});
