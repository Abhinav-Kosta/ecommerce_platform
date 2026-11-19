const express = require("express");

const { protect } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");

const {
  createOrderSchema,
} = require("../validators/orderValidators");

const {
  createUserOrder,
} = require("../controllers/orderController");

const router = express.Router();

// All order routes require authentication
router.use(protect);

// Create a new order
router.post(
  "/",
  validateRequest(createOrderSchema),
  createUserOrder
);

module.exports = router;