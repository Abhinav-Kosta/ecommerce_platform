const Product = require("../src/models/Product");
const AppError = require("../src/utils/AppError");

const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../src/services/productService");

jest.mock("../src/models/Product", () => ({
  create: jest.fn(),
  find: jest.fn(),
  countDocuments: jest.fn(),
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));

describe("Product Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // CREATE PRODUCT
  describe("createProduct", () => {
    it("should create and return a product", async () => {
      const productData = {
        name: "Laptop",
        description: "A powerful laptop",
        price: 75000,
        category: "Electronics",
        stock: 10,
      };

      const createdProduct = {
        _id: "product123",
        ...productData,
      };

      Product.create.mockResolvedValue(createdProduct);

      const result = await createProduct(productData);

      expect(Product.create).toHaveBeenCalledWith(productData);
      expect(result).toEqual(createdProduct);
    });

    it("should propagate errors when product creation fails", async () => {
      const error = new Error("Database error");

      Product.create.mockRejectedValue(error);

      await expect(createProduct({ name: "Laptop" }))
        .rejects.toThrow(error);
    });

    it("should reject a discount price greater than the original price", async () => {
      const productData = {
        name: "Laptop",
        description: "A powerful laptop",
        price: 50000,
        discountPrice: 55000,
        category: "Electronics",
        stock: 10,
      };
    
      await expect(createProduct(productData)).rejects.toMatchObject({
        statusCode: 400,
        message: "Discount price must be lower than the original price",
      });
    
      expect(Product.create).not.toHaveBeenCalled();
    });

    it("should reject a discount price equal to the original price", async () => {
      const productData = {
        name: "Laptop",
        description: "A powerful laptop",
        price: 50000,
        discountPrice: 50000,
        category: "Electronics",
        stock: 10,
      };
    
      await expect(createProduct(productData)).rejects.toMatchObject({
        statusCode: 400,
        message: "Discount price must be lower than the original price",
      });
    
      expect(Product.create).not.toHaveBeenCalled();
    });
  });

  // GET ALL PRODUCTS
  describe("getAllProducts", () => {
    const mockProducts = [
      { _id: "product1", name: "Laptop" },
      { _id: "product2", name: "Phone" },
    ];

    const mockQueryChain = (products) => {
      const query = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(products),
      };

      Product.find.mockReturnValue(query);

      return query;
    };

    it("should return active products with default pagination", async () => {
      const query = mockQueryChain(mockProducts);

      Product.countDocuments.mockResolvedValue(2);

      const result = await getAllProducts({});

      expect(Product.find).toHaveBeenCalledWith({
        isActive: true,
      });

      expect(query.sort).toHaveBeenCalledWith({
        createdAt: -1,
      });

      expect(query.skip).toHaveBeenCalledWith(0);
      expect(query.limit).toHaveBeenCalledWith(12);

      expect(result).toEqual({
        products: mockProducts,
        pagination: {
          totalProducts: 2,
          currentPage: 1,
          totalPages: 1,
          limit: 12,
        },
      });
    });

    it("should filter products by search, category, and brand", async () => {
      mockQueryChain(mockProducts);
      Product.countDocuments.mockResolvedValue(2);

      await getAllProducts({
        search: "laptop",
        category: "Electronics",
        brand: "Dell",
      });

      expect(Product.find).toHaveBeenCalledWith({
        isActive: true,
        $or: [
          { name: { $regex: "laptop", $options: "i" } },
          { description: { $regex: "laptop", $options: "i" } },
        ],
        category: "Electronics",
        brand: "Dell",
      });
    });

    it("should filter products by minimum and maximum price", async () => {
      mockQueryChain(mockProducts);
      Product.countDocuments.mockResolvedValue(2);

      await getAllProducts({
        minPrice: "100",
        maxPrice: "1000",
      });

      expect(Product.find).toHaveBeenCalledWith({
        isActive: true,
        price: {
          $gte: 100,
          $lte: 1000,
        },
      });
    });

    it("should apply the requested sorting option", async () => {
      const query = mockQueryChain(mockProducts);
      Product.countDocuments.mockResolvedValue(2);

      await getAllProducts({
        sort: "price_asc",
      });

      expect(query.sort).toHaveBeenCalledWith({
        price: 1,
      });
    });

    it("should apply pagination correctly", async () => {
      const query = mockQueryChain(mockProducts);
      Product.countDocuments.mockResolvedValue(25);

      const result = await getAllProducts({
        page: "2",
        limit: "10",
      });

      expect(query.skip).toHaveBeenCalledWith(10);
      expect(query.limit).toHaveBeenCalledWith(10);

      expect(result.pagination).toEqual({
        totalProducts: 25,
        currentPage: 2,
        totalPages: 3,
        limit: 10,
      });
    });

    it("should use newest sorting when an invalid sort option is provided", async () => {
      const query = mockQueryChain(mockProducts);
      Product.countDocuments.mockResolvedValue(2);

      await getAllProducts({
        sort: "invalid_sort",
      });

      expect(query.sort).toHaveBeenCalledWith({
        createdAt: -1,
      });
    });
  });

  // GET PRODUCT BY ID
  describe("getProductById", () => {
    it("should return an active product by ID", async () => {
      const product = {
        _id: "product123",
        name: "Laptop",
        isActive: true,
      };

      Product.findOne.mockResolvedValue(product);

      const result = await getProductById("product123");

      expect(Product.findOne).toHaveBeenCalledWith({
        _id: "product123",
        isActive: true,
      });

      expect(result).toEqual(product);
    });

    it("should throw a 404 error when updating a missing or inactive product", async () => {
      Product.findOne.mockResolvedValue(null);

      await expect(
        updateProduct("unknown", { name: "Updated Laptop" })
      ).rejects.toMatchObject({
        statusCode: 404,
        message: "Product not found",
      });
    
      expect(Product.findOneAndUpdate).not.toHaveBeenCalled();
    });
  });

  // UPDATE PRODUCT
  describe("updateProduct", () => {
    it("should update and return an active product", async () => {
      const existingProduct = {
        _id: "product123",
        name: "Laptop",
        price: 75000,
        discountPrice: 70000,
        isActive: true,
      };
    
      const updatedProduct = {
        ...existingProduct,
        name: "Updated Laptop",
      };
    
      const updateData = {
        name: "Updated Laptop",
      };
    
      Product.findOne.mockResolvedValue(existingProduct);
      // Product.findOneAndUpdate.mockResolvedValue(updatedProduct);
      Product.findByIdAndUpdate.mockResolvedValue(updatedProduct);

      const result = await updateProduct("product123", updateData);
    
      expect(Product.findOne).toHaveBeenCalledWith({
        _id: "product123",
        isActive: true,
      });
    
      // expect(Product.findOneAndUpdate).toHaveBeenCalledWith(
      //   "product123",
      //   updateData,
      //   {
      //     new: true,
      //     runValidators: true,
      //   }
      // );

      expect(Product.findByIdAndUpdate).toHaveBeenCalledWith(
        "product123",
        updateData,
        {
          new: true,
          runValidators: true,
        }
      );
    
      expect(result).toEqual(updatedProduct);
    });

    it("should reject a discount price greater than the existing original price", async () => {
      Product.findOne.mockResolvedValue({
        _id: "product123",
        price: 50000,
        discountPrice: 45000,
        isActive: true,
      });
    
      await expect(
        updateProduct("product123", { discountPrice: 55000 })
      ).rejects.toMatchObject({
        statusCode: 400,
        message: "Discount price must be lower than the original price",
      });
    
      expect(Product.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it("should allow updating both prices with a valid discount", async () => {
      const updatedProduct = {
        _id: "product123",
        price: 60000,
        discountPrice: 50000,
        isActive: true,
      };
    
      Product.findOne.mockResolvedValue({
        _id: "product123",
        price: 50000,
        discountPrice: 45000,
        isActive: true,
      });
    
      Product.findByIdAndUpdate.mockResolvedValue(updatedProduct);
    
      const result = await updateProduct("product123", {
        price: 60000,
        discountPrice: 50000,
      });
    
      expect(result).toEqual(updatedProduct);
    });

    it("should reject updating both prices with an invalid discount", async () => {
      Product.findOne.mockResolvedValue({
        _id: "product123",
        price: 50000,
        discountPrice: 45000,
        isActive: true,
      });
    
      await expect(
        updateProduct("product123", {
          price: 40000,
          discountPrice: 45000,
        })
      ).rejects.toMatchObject({
        statusCode: 400,
        message: "Discount price must be lower than the original price",
      });
    
      expect(Product.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it("should throw a 404 error when updating a missing or inactive product", async () => {
      Product.findOne.mockResolvedValue(null);

      await expect(
        updateProduct("unknown", { name: "Updated Laptop" })
      ).rejects.toMatchObject({
        statusCode: 404,
        message: "Product not found",
      });
    
      expect(Product.findByIdAndUpdate).not.toHaveBeenCalled();
    });
  });

  // SOFT DELETE PRODUCT
  describe("deleteProduct", () => {
    it("should soft-delete a product by setting isActive to false", async () => {
      const deletedProduct = {
        _id: "product123",
        name: "Laptop",
        isActive: false,
      };

      Product.findOneAndUpdate.mockResolvedValue(deletedProduct);

      const result = await deleteProduct("product123");

      expect(Product.findOneAndUpdate).toHaveBeenCalledWith(
        {
          _id: "product123",
          isActive: true,
        },
        {
          isActive: false,
        },
        {
          new: true,
          runValidators: true,
        }
      );

      expect(result.isActive).toBe(false);
    });

    it("should throw a 404 error when deleting a missing or already inactive product", async () => {
      Product.findOneAndUpdate.mockResolvedValue(null);

      await expect(deleteProduct("unknown"))
        .rejects.toMatchObject({
          statusCode: 404,
          message: "Product not found",
        });
    });
  });
});