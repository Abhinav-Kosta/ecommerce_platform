const asyncHandler = require("../utils/asyncHandler");

const {
  processDemoPayment,
} = require("../services/paymentService");

const processPayment = asyncHandler(async (req, res) => {
  const { orderId, paymentResult } = req.body;

  const order = await processDemoPayment(
    req.user._id,
    orderId,
    paymentResult
  );

  res.status(200).json({
    status: "success",
    message:
      paymentResult === "success"
        ? "Demo payment successful"
        : "Demo payment failed",
    data: {
      order,
    },
  });
});

module.exports = {
  processPayment,
};