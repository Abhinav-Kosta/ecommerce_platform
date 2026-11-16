const productService = require("../src/services/productService");

const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../src/controllers/productController");

jest.mock("../src/services/productService", () => ({
  createProduct: jest.fn(),
  getAllProducts: jest.fn(),
  getProductById: jest.fn(),
  updateProduct: jest.fn(),
  deleteProduct: jest.fn(),
}));

// Mock asyncHandler so controller functions can be tested directly
jest.mock("../src/utils/asyncHandler", () => (handler) => handler);

describe("Product Controller", () => {
  let req;
  let res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      validated: {
        body: {},
        query: {},
        params: {},
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  // CREATE PRODUCT
  describe("createProduct", () => {
    it("should create a product and return status 201", async () => {
      const productData = {
        name: "Laptop",
        price: 75000,
      };

      const createdProduct = {
        _id: "product123",
        ...productData,
      };

      req.validated.body = productData;

      productService.createProduct.mockResolvedValue(createdProduct);

      await createProduct(req, res);

      expect(productService.createProduct).toHaveBeenCalledWith(
        productData,
        undefined
      );

      expect(res.status).toHaveBeenCalledWith(201);

      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message: "Product created successfully",
        data: {
          product: createdProduct,
        },
      });
    });
  });

  // GET ALL PRODUCTS
  describe("getAllProducts", () => {
    it("should return products with pagination", async () => {
      const query = {
        page: 1,
        limit: 12,
      };

      const serviceResult = {
        products: [
          { _id: "product1", name: "Laptop" },
          { _id: "product2", name: "Phone" },
        ],
        pagination: {
          totalProducts: 2,
          currentPage: 1,
          totalPages: 1,
          limit: 12,
        },
      };

      req.validated.query = query;

      productService.getAllProducts.mockResolvedValue(serviceResult);

      await getAllProducts(req, res);

      expect(productService.getAllProducts).toHaveBeenCalledWith(query);

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        results: 2,
        data: serviceResult,
      });
    });
  });

  // GET PRODUCT BY ID
  describe("getProductById", () => {
    it("should return a product by ID", async () => {
      const product = {
        _id: "product123",
        name: "Laptop",
      };

      req.validated.params.id = "product123";

      productService.getProductById.mockResolvedValue(product);

      await getProductById(req, res);

      expect(productService.getProductById).toHaveBeenCalledWith(
        "product123"
      );

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: {
          product,
        },
      });
    });
  });

  // UPDATE PRODUCT
  describe("updateProduct", () => {
    it("should update a product and return the updated product", async () => {
      const updateData = {
        name: "Updated Laptop",
      };

      const updatedProduct = {
        _id: "product123",
        ...updateData,
      };

      req.validated.params.id = "product123";
      req.validated.body = updateData;

      productService.updateProduct.mockResolvedValue(updatedProduct);

      await updateProduct(req, res);

      expect(productService.updateProduct).toHaveBeenCalledWith(
        "product123",
        updateData,
        undefined
      );

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message: "Product updated successfully",
        data: {
          product: updatedProduct,
        },
      });
    });
  });

  // DELETE PRODUCT
  describe("deleteProduct", () => {
    it("should soft-delete a product and return success", async () => {
      req.validated.params.id = "product123";

      productService.deleteProduct.mockResolvedValue({
        _id: "product123",
        isActive: false,
      });

      await deleteProduct(req, res);

      expect(productService.deleteProduct).toHaveBeenCalledWith(
        "product123"
      );

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message: "Product deleted successfully",
      });
    });
  });
});