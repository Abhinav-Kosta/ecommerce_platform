const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [80, "Name cannot exceed 80 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      maxlength: [254, "Email cannot exceed 254 characters"],
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },

    passwordHash: {
      type: String,
      required: [true, "Password hash is required"],
      select: false,
    },

    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
      required: true,
    },
    tokenVersion: {
    type: Number,
    default: 0,
    select: false,
  },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Enforce uniqueness at the database level.
userSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model("User", userSchema);