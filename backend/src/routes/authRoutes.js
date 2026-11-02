const express = require("express");

const { register, login, logout } = require("../controllers/authController");
const validateRequest = require("../middleware/validateRequest");
const { registerSchema, loginSchema } = require("../validators/authValidators");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

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

router.post("/logout", asyncHandler(logout));

module.exports = router;