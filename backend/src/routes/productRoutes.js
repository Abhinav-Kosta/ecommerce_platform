const express = require("express");

const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const { protect } = require("../middleware/authMiddleware");
const { restrictTo } = require("../middleware/roleMiddleware");
const validateRequest = require("../middleware/validateRequest");

const {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
  productIdSchema,
} = require("../validators/productValidators");

const router = express.Router();

// Public routes

router.get(
  "/",
  validateRequest(productQuerySchema, "query"),
  getAllProducts
);

router.get(
  "/:id",
  validateRequest(productIdSchema, "params"),
  getProductById
);

// Admin-only routes

router.post(
  "/",
  protect,
  restrictTo("admin"),
  validateRequest(createProductSchema, "body"),
  createProduct
);

router.patch(
  "/:id",
  protect,
  restrictTo("admin"),
  validateRequest(productIdSchema, "params"),
  validateRequest(updateProductSchema, "body"),
  updateProduct
);

router.delete(
  "/:id",
  protect,
  restrictTo("admin"),
  validateRequest(productIdSchema, "params"),
  deleteProduct
);

module.exports = router;