const asyncHandler = require("../utils/asyncHandler");

const {
  createOrder,
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

module.exports = {
  createUserOrder,
};