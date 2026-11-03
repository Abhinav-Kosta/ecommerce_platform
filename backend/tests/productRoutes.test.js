const express = require("express");
const request = require("supertest");

const productRoutes = require("../src/routes/productRoutes");

const { protect } = require("../src/middleware/authMiddleware");
const { restrictTo } = require("../src/middleware/roleMiddleware");

jest.mock("../src/middleware/authMiddleware", () => ({
  protect: jest.fn((req, res, next) => next()),
}));

jest.mock("../src/middleware/roleMiddleware", () => ({
  restrictTo: jest.fn(() => (req, res, next) => next()),
}));

jest.mock("../src/controllers/productController", () => ({
  createProduct: (req, res) =>
    res.status(201).json({ message: "Product created" }),

  getAllProducts: (req, res) =>
    res.status(200).json({ message: "Products retrieved" }),

  getProductById: (req, res) =>
    res.status(200).json({ message: "Product retrieved" }),

  updateProduct: (req, res) =>
    res.status(200).json({ message: "Product updated" }),

  deleteProduct: (req, res) =>
    res.status(200).json({ message: "Product deleted" }),
}));

const app = express();

app.use(express.json());
app.use("/api/v1/products", productRoutes);

describe("Product Route Configuration", () => {
  it("should configure product mutation routes for admins", () => {
    expect(restrictTo).toHaveBeenCalledWith("admin");
  });
});

describe("Product Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/v1/products", () => {
    it("should return all products", async () => {
      const response = await request(app)
        .get("/api/v1/products");

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Products retrieved");
    });

    it("should reject invalid pagination parameters", async () => {
      const response = await request(app)
        .get("/api/v1/products?page=0");

      expect(response.status).toBe(400);
    });
  });

  describe("GET /api/v1/products/:id", () => {
    it("should return a product by ID", async () => {
      const response = await request(app)
        .get("/api/v1/products/507f1f77bcf86cd799439011");

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Product retrieved");
    });

    it("should reject an invalid product ID", async () => {
      const response = await request(app)
        .get("/api/v1/products/invalid-id");

      expect(response.status).toBe(400);
    });
  });

  describe("POST /api/v1/products", () => {
    it("should allow an authenticated admin to create a product", async () => {
      const response = await request(app)
        .post("/api/v1/products")
        .send({
          name: "Laptop",
          description: "A powerful laptop for everyday work",
          price: 75000,
          category: "Electronics",
          stock: 10,
        });
      
      expect(response.status).toBe(201);
      expect(response.body.message).toBe("Product created");
      
      // Verify that the admin authorization middleware was registered
      // on the POST route.
      // expect(restrictTo).toHaveBeenCalledWith("admin");
    });
  });

  describe("PATCH /api/v1/products/:id", () => {
    it("should update a product", async () => {
      const response = await request(app)
        .patch("/api/v1/products/507f1f77bcf86cd799439011")
        .send({
          name: "Updated Laptop",
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Product updated");
    });

    it("should reject an invalid product ID", async () => {
      const response = await request(app)
        .patch("/api/v1/products/invalid-id")
        .send({
          name: "Updated Laptop",
        });

      expect(response.status).toBe(400);
    });
  });

  describe("DELETE /api/v1/products/:id", () => {
    it("should soft-delete a product", async () => {
      const response = await request(app)
        .delete("/api/v1/products/507f1f77bcf86cd799439011");

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Product deleted");
    });

    it("should reject an invalid product ID", async () => {
      const response = await request(app)
        .delete("/api/v1/products/invalid-id");

      expect(response.status).toBe(400);
    });
  });
});