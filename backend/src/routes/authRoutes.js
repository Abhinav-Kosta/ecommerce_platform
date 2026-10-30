const express = require("express");

const { register } = require("../controllers/authController");
const validateRequest = require("../middleware/validateRequest");
const { registerSchema } = require("../validators/authValidators");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.post(
  "/register",
  validateRequest(registerSchema, "body"),
  asyncHandler(register)
);

module.exports = router;