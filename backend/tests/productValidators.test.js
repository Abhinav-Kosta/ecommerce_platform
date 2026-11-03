const {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
  productIdSchema,
} = require("../src/validators/productValidators");

describe("Product Validators - Create Product", () => {
  const validProduct = {
    name: "Wireless Headphones",
    description: "Premium wireless headphones with noise cancellation",
    price: 2999,
    discountPrice: 2499,
    category: "Electronics",
    brand: "SoundMax",
    images: ["https://example.com/headphones.jpg"],
    stock: 20,
  };

  it("should accept valid product data", () => {
    const { error, value } = createProductSchema.validate(validProduct);

    expect(error).toBeUndefined();
    expect(value).toMatchObject(validProduct);
  });

  it("should reject missing required fields", () => {
    const { error } = createProductSchema.validate({});

    expect(error).toBeDefined();
    expect(error.details.length).toBeGreaterThan(0);
  });

  it("should reject a product name shorter than 2 characters", () => {
    const { error } = createProductSchema.validate({
      ...validProduct,
      name: "A",
    });

    expect(error).toBeDefined();
  });

  it("should reject a product name longer than 150 characters", () => {
    const { error } = createProductSchema.validate({
      ...validProduct,
      name: "A".repeat(151),
    });

    expect(error).toBeDefined();
  });

  it("should reject a description shorter than 10 characters", () => {
    const { error } = createProductSchema.validate({
      ...validProduct,
      description: "Short",
    });

    expect(error).toBeDefined();
  });

  it("should reject zero or negative prices", () => {
    for (const price of [0, -100]) {
      const { error } = createProductSchema.validate({
        ...validProduct,
        price,
      });

      expect(error).toBeDefined();
    }
  });

  it("should reject a discount price greater than the original price", () => {
    const { error } = createProductSchema.validate({
      ...validProduct,
      discountPrice: 3500,
    });

    expect(error).toBeDefined();
  });

  it("should reject a discount price equal to the original price", () => {
    const { error } = createProductSchema.validate({
      ...validProduct,
      discountPrice: 2999,
    });

    expect(error).toBeDefined();
  });

  it("should allow a product without discountPrice", () => {
    const product = { ...validProduct };
    delete product.discountPrice;

    const { error } = createProductSchema.validate(product);

    expect(error).toBeUndefined();
  });

  it("should reject negative stock", () => {
    const { error } = createProductSchema.validate({
      ...validProduct,
      stock: -5,
    });

    expect(error).toBeDefined();
  });

  it("should reject decimal stock values", () => {
    const { error } = createProductSchema.validate({
      ...validProduct,
      stock: 5.5,
    });

    expect(error).toBeDefined();
  });

  it("should default images to an empty array", () => {
    const product = { ...validProduct };
    delete product.images;

    const { error, value } = createProductSchema.validate(product);

    expect(error).toBeUndefined();
    expect(value.images).toEqual([]);
  });

  it("should reject invalid image URLs", () => {
    const { error } = createProductSchema.validate({
      ...validProduct,
      images: ["not-a-valid-url"],
    });

    expect(error).toBeDefined();
  });

  it("should reject protected fields supplied by the client", () => {
    const { error } = createProductSchema.validate({
      ...validProduct,
      ratings: 5,
      numReviews: 100,
      isActive: false,
    });

    expect(error).toBeDefined();
  });

  it("should trim string fields", () => {
    const { error, value } = createProductSchema.validate({
      ...validProduct,
      name: "  Wireless Headphones  ",
      category: "  Electronics  ",
    });

    expect(error).toBeUndefined();
    expect(value.name).toBe("Wireless Headphones");
    expect(value.category).toBe("Electronics");
  });
});

describe("Product Validators - Update Product", () => {
  it("should accept a valid partial update", () => {
    const { error, value } = updateProductSchema.validate({
      price: 3499,
    });

    expect(error).toBeUndefined();
    expect(value.price).toBe(3499);
  });

  it("should reject an empty update object", () => {
    const { error } = updateProductSchema.validate({});

    expect(error).toBeDefined();
  });

  it("should reject invalid update fields", () => {
    const { error } = updateProductSchema.validate({
      stock: -10,
    });

    expect(error).toBeDefined();
  });

  it("should reject a discount price without the original price", () => {
    const { error } = updateProductSchema.validate({
      discountPrice: 1999,
    });

    expect(error).toBeDefined();
  });

  it("should accept discountPrice when price is included", () => {
    const { error } = updateProductSchema.validate({
      price: 2999,
      discountPrice: 2499,
    });

    expect(error).toBeUndefined();
  });

  it("should reject protected fields supplied by the client", () => {
    const { error } = updateProductSchema.validate({
      ratings: 5,
      numReviews: 100,
      isActive: false,
    });

    expect(error).toBeDefined();
  });
});

describe("productQuerySchema", () => {
  it("should accept valid query parameters", () => {
    const result = productQuerySchema.validate({
      search: "laptop",
      category: "Electronics",
      brand: "Dell",
      minPrice: 1000,
      maxPrice: 50000,
      sort: "price_asc",
      page: 2,
      limit: 10,
    });

    expect(result.error).toBeUndefined();
  });

  it("should apply default values", () => {
    const result = productQuerySchema.validate({});

    expect(result.error).toBeUndefined();
    expect(result.value).toEqual({
      sort: "newest",
      page: 1,
      limit: 12,
    });
  });

  it("should reject an invalid sorting option", () => {
    const result = productQuerySchema.validate({
      sort: "invalid_sort",
    });

    expect(result.error).toBeDefined();
  });

  it("should reject negative prices", () => {
    const result = productQuerySchema.validate({
      minPrice: -100,
    });

    expect(result.error).toBeDefined();
  });

  it("should reject minimum price greater than maximum price", () => {
    const result = productQuerySchema.validate({
      minPrice: 5000,
      maxPrice: 1000,
    });

    expect(result.error).toBeDefined();
    expect(result.error.message).toBe(
      "Minimum price cannot exceed maximum price"
    );
  });

  it("should reject page values below 1", () => {
    const result = productQuerySchema.validate({
      page: 0,
    });

    expect(result.error).toBeDefined();
  });

  it("should reject limits greater than 100", () => {
    const result = productQuerySchema.validate({
      limit: 101,
    });

    expect(result.error).toBeDefined();
  });

  it("should reject search strings longer than 100 characters", () => {
    const result = productQuerySchema.validate({
      search: "a".repeat(101),
    });

    expect(result.error).toBeDefined();
  });
});

describe("Product Validators - Product ID", () => {
  it("should accept a valid MongoDB ObjectId", () => {
    const { error } = productIdSchema.validate({
      id: "507f1f77bcf86cd799439011",
    });

    expect(error).toBeUndefined();
  });

  it("should reject an invalid MongoDB ObjectId", () => {
    const { error } = productIdSchema.validate({
      id: "invalid-id",
    });

    expect(error).toBeDefined();
  });

  it("should reject an ObjectId with incorrect length", () => {
    const { error } = productIdSchema.validate({
      id: "507f1f77bcf86cd79943901",
    });

    expect(error).toBeDefined();
  });

  it("should reject a missing product ID", () => {
    const { error } = productIdSchema.validate({});

    expect(error).toBeDefined();
  });
});