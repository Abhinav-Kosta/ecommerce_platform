const express = require("express");

const { protect } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");

const {
  addToCartSchema,
  updateCartItemSchema,
} = require("../validators/cartValidators");

const {
  addItemToCart,
  getUserCart,
  updateCartItemQuantity,
  removeItemFromCart,
  clearUserCart
} = require("../controllers/cartController");

const router = express.Router();

// All cart routes require authentication
router.use(protect);

// Get the authenticated user's cart
router.get("/", getUserCart);

// Add product to cart
router.post(
  "/",
  validateRequest(addToCartSchema,),
  addItemToCart
);

// Update the quantity of a cart item
router.patch(
  "/:productId",
  validateRequest(updateCartItemSchema),
  updateCartItemQuantity
);

// Remove a product from the cart
router.delete("/:productId", removeItemFromCart);

// Clear the entire cart
router.delete("/", clearUserCart);

module.exports = router;