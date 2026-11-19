const express = require("express");

const { protect } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");

const {
  processPaymentSchema,
} = require("../validators/paymentValidators");

const {
  processPayment,
} = require("../controllers/paymentController");

const router = express.Router();

// All payment routes require authentication
router.use(protect);

// Process demo payment
router.post(
  "/",
  validateRequest(processPaymentSchema),
  processPayment
);

module.exports = router;