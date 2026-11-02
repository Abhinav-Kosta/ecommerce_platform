const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    throw new AppError("You are not authenticated. Please log in.", 401);
  }

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new AppError("Invalid or expired authentication token", 401);
  }

  const user = await User.findById(decoded.id);

  if (!user) {
    throw new AppError("The user associated with this token no longer exists", 401);
  }

  req.user = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  next();
});

module.exports = {
  protect,
};