const express = require("express");

const { protect } = require("../middleware/authMiddleware");
const { restrictTo } = require("../middleware/roleMiddleware");
const validateRequest = require("../middleware/validateRequest");

const {
  createOrderSchema,
  updateOrderStatusSchema,
} = require("../validators/orderValidators");

const {
  paginationQuerySchema,
} = require("../validators/commonValidators");

const {
  createUserOrder,
  getMyOrders,
  getMyOrderById,
  getAdminOrders,
  getAdminOrderByIdController,
  updateAdminOrderStatus,
} = require("../controllers/orderController");

const router = express.Router();

// All order routes require authentication
router.use(protect);

// Customer routes

router.post(
  "/",
  validateRequest(createOrderSchema),
  createUserOrder
);

router.get(
  "/my-orders",
  validateRequest(paginationQuerySchema, "query"),
  getMyOrders
);

// Admin routes

router.get(
  "/admin",
  restrictTo("admin"),
  validateRequest(paginationQuerySchema, "query"),
  getAdminOrders
);

router.get(
  "/admin/:id",
  restrictTo("admin"),
  validateRequest(
    require("../validators/productValidators").productIdSchema,
    "params"
  ),
  getAdminOrderByIdController
);

router.get(
  "/:id",
  validateRequest(
    require("../validators/productValidators").productIdSchema,
    "params"
  ),
  getMyOrderById
);

router.patch(
  "/admin/:id/status",
  restrictTo("admin"),
  validateRequest(
    require("../validators/productValidators").productIdSchema,
    "params"
  ),
  validateRequest(updateOrderStatusSchema),
  updateAdminOrderStatus
);

module.exports = router;