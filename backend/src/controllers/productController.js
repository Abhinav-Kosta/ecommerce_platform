const productService = require("../services/productService");
const asyncHandler = require("../utils/asyncHandler");

// Create a new product
const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(
    req.validated.body,
    req.files
  );

  res.status(201).json({
    status: "success",
    message: "Product created successfully",
    data: {
      product,
    },
  });
});

// Get all active products
const getAllProducts = asyncHandler(async (req, res) => {
  const result = await productService.getAllProducts(req.validated.query);

  res.status(200).json({
    status: "success",
    results: result.products.length,
    data: result,
  });
});

// Get a single product
const getProductById = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.validated.params.id);

  res.status(200).json({
    status: "success",
    data: {
      product,
    },
  });
});

// Update an existing product
const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(
    req.validated.params.id,
    req.validated.body,
    req.files
  );

  res.status(200).json({
    status: "success",
    message: "Product updated successfully",
    data: {
      product,
    },
  });
});

// Soft-delete a product
const deleteProduct = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.validated.params.id);

  res.status(200).json({
    status: "success",
    message: "Product deleted successfully",
  });
});

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};