const mongoose = require("mongoose");
const Product = require("../src/models/Product");

describe("Product Model", () => {
  const validProduct = {
    name: "Wireless Headphones",
    description: "Premium wireless headphones",
    price: 2999,
    discountPrice: 2499,
    category: "Electronics",
    brand: "SoundMax",
    images: [
      {
        url: "https://example.com/headphones.jpg",
        publicId: "ecommerce/products/headphones",
      },
    ],
    stock: 20,
  };

  it("should create a valid product", async () => {
    const product = new Product(validProduct);

    await expect(product.validate()).resolves.toBeUndefined();

    expect(product.name).toBe("Wireless Headphones");
    expect(product.price).toBe(2999);
    expect(product.discountPrice).toBe(2499);
    expect(product.category).toBe("Electronics");
  });

  it("should require name, description, price, category, and stock", async () => {
    const product = new Product({});

    let error;

    try {
      await product.validate();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors.name).toBeDefined();
    expect(error.errors.description).toBeDefined();
    expect(error.errors.price).toBeDefined();
    expect(error.errors.category).toBeDefined();
    expect(error.errors.stock).toBeDefined();
  });

  it("should apply default values", () => {
    const product = new Product(validProduct);

    expect(product.images).toHaveLength(1);

    expect(product.images[0]).toMatchObject({
      url: "https://example.com/headphones.jpg",
      publicId: "ecommerce/products/headphones",
    });
    
    expect(product.ratings).toBe(0);
    expect(product.numReviews).toBe(0);
    expect(product.isActive).toBe(true);
  });

  it("should reject a negative price", async () => {
    const product = new Product({
      ...validProduct,
      price: -100,
    });

    await expect(product.validate()).rejects.toMatchObject({
      name: "ValidationError",
    });
  });

  it("should reject a zero price", async () => {
    const product = new Product({
      ...validProduct,
      price: 0,
    });

    await expect(product.validate()).rejects.toMatchObject({
      name: "ValidationError",
    });
  });

  it("should allow a product without discountPrice", async () => {
    const product = new Product({
      ...validProduct,
      discountPrice: undefined,
    });

    await expect(product.validate()).resolves.toBeUndefined();
  });

  it("should reject negative stock", async () => {
    const product = new Product({
      ...validProduct,
      stock: -5,
    });

    await expect(product.validate()).rejects.toMatchObject({
      name: "ValidationError",
    });
  });

  it("should reject decimal stock values", async () => {
    const product = new Product({
      ...validProduct,
      stock: 5.5,
    });

    await expect(product.validate()).rejects.toMatchObject({
      name: "ValidationError",
    });
  });

  it("should reject ratings greater than 5", async () => {
    const product = new Product({
      ...validProduct,
      ratings: 6,
    });

    await expect(product.validate()).rejects.toMatchObject({
      name: "ValidationError",
    });
  });

  it("should reject negative ratings", async () => {
    const product = new Product({
      ...validProduct,
      ratings: -1,
    });

    await expect(product.validate()).rejects.toMatchObject({
      name: "ValidationError",
    });
  });

  it("should reject negative number of reviews", async () => {
    const product = new Product({
      ...validProduct,
      numReviews: -1,
    });

    await expect(product.validate()).rejects.toMatchObject({
      name: "ValidationError",
    });
  });

  it("should reject decimal number of reviews", async () => {
    const product = new Product({
      ...validProduct,
      numReviews: 2.5,
    });

    await expect(product.validate()).rejects.toMatchObject({
      name: "ValidationError",
    });
  });

  it("should trim string fields", async () => {
    const product = new Product({
      ...validProduct,
      name: "  Wireless Headphones  ",
      description: "  Premium headphones  ",
      category: "  Electronics  ",
      brand: "  SoundMax  ",
    });

    await product.validate();

    expect(product.name).toBe("Wireless Headphones");
    expect(product.description).toBe("Premium headphones");
    expect(product.category).toBe("Electronics");
    expect(product.brand).toBe("SoundMax");
  });

  it("should support optional brand", async () => {
    const product = new Product({
      ...validProduct,
      brand: undefined,
    });

    await expect(product.validate()).resolves.toBeUndefined();
  });

  it("should enable automatic timestamps", () => {
    const product = new Product(validProduct);

    expect(productSchemaTimestampsEnabled()).toBe(true);
  });
});

function productSchemaTimestampsEnabled() {
  return Product.schema.options.timestamps === true;
}