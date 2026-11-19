const asyncHandler = require("../utils/asyncHandler");

const {
  createOrder,
  getUserOrders,
  getOrderById,
  getAdminOrderById,
  getAllOrders,
  updateOrderStatus,
} = require("../services/orderService");

const createUserOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod } = req.body;

  const order = await createOrder(
    req.user._id,
    shippingAddress,
    paymentMethod
  );

  res.status(201).json({
    status: "success",
    message: "Order created successfully",
    data: {
      order,
    },
  });
});

const getMyOrders = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 12;

  const result = await getUserOrders(
    req.user._id,
    page,
    limit
  );

  res.status(200).json({
    status: "success",
    data: result,
  });
});

const getMyOrderById = asyncHandler(async (req, res) => {
  const order = await getOrderById(
    req.params.id,
    req.user._id
  );

  res.status(200).json({
    status: "success",
    data: {
      order,
    },
  });
});

const getAdminOrders = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 12;

  const result = await getAllOrders(page, limit);

  res.status(200).json({
    status: "success",
    data: result,
  });
});

const getAdminOrderByIdController = asyncHandler(async (req, res) => {
  const order = await getAdminOrderById(req.params.id);

  res.status(200).json({
    status: "success",
    data: {
      order,
    },
  });
});

const updateAdminOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus } = req.body;

  const order = await updateOrderStatus(
    req.params.id,
    orderStatus
  );

  res.status(200).json({
    status: "success",
    message: "Order status updated successfully",
    data: {
      order,
    },
  });
});

module.exports = {
  createUserOrder,
  getMyOrders,
  getMyOrderById,
  getAdminOrders,
  getAdminOrderByIdController,
  updateAdminOrderStatus,
};