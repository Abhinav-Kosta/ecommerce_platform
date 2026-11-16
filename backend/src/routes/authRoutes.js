const express = require("express");

const { 
  register, 
  login, 
  logout, 
  getMe,
  updateMyProfile,
  updatePassword 
} = require("../controllers/authController");

const { 
  registerSchema, 
  loginSchema, 
  changePasswordSchema,
  updateProfileSchema,
} = require("../validators/authValidators");

const validateRequest = require("../middleware/validateRequest");
const { protect } = require("../middleware/authMiddleware");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get("/me", protect, asyncHandler(getMe));

router.patch(
  "/me",
  protect,
  validateRequest(updateProfileSchema, "body"),
  asyncHandler(updateMyProfile)
);

router.post(
  "/register",
  validateRequest(registerSchema, "body"),
  asyncHandler(register)
);

router.post(
  "/login",
  validateRequest(loginSchema, "body"),
  asyncHandler(login)
);

router.patch(
  "/change-password",
  protect,
  validateRequest(changePasswordSchema, "body"),
  asyncHandler(updatePassword)
);

router.post("/logout", asyncHandler(logout));

module.exports = router;