const bcrypt = require("bcryptjs");
const User = require("../models/User");
const AppError = require("../utils/AppError");

const registerUser = async ({ name, email, password }) => {
  // Normalize email before checking for an existing account.
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    throw new AppError("Email is already registered", 409);
  }

  // Generate a secure password hash.
  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const user = await User.create({
      name,
      email: normalizedEmail,
      passwordHash,
      role: "customer",
    });

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  } catch (error) {
    // Handle duplicate email race conditions.
    if (error.code === 11000) {
      throw new AppError("Email is already registered", 409);
    }

    throw error;
  }
};

module.exports = {
  registerUser,
};