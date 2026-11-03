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

const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail })
    .select("+passwordHash +tokenVersion");

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    tokenVersion: user.tokenVersion,
  };
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select(
    "+passwordHash +tokenVersion"
  );

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const isPasswordValid = await bcrypt.compare(
    currentPassword,
    user.passwordHash
  );

  if (!isPasswordValid) {
    throw new AppError("Current password is incorrect", 401);
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  user.passwordHash = passwordHash;
  user.tokenVersion += 1;
  await user.save();

  return {
    message: "Password changed successfully",
  };
};

module.exports = {
  registerUser,
  loginUser,
  changePassword,
};