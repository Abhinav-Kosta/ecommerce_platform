const { registerUser, loginUser, changePassword } = require("../services/authService");

const { generateToken } = require("../utils/tokenUtils");
const { setAuthCookie, clearAuthCookie, } = require("../utils/cookieUtils");

const register = async (req, res) => {
  const user = await registerUser(req.validated.body);

  res.status(201).json({
    success: true,
    message: "Registration successful",
    data: {
      user,
    },
  });
};

const login = async (req, res) => {
  const user = await loginUser(req.validated.body);

  const token = generateToken(user.id);

  setAuthCookie(res, token);

  //Testing purpose
  // console.log("Token generated:", !!token);
  // console.log("NODE_ENV:", process.env.NODE_ENV);
  // console.log("Set-Cookie header:", res.getHeader("Set-Cookie"));

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: { user },
  });
};

const getMe = async (req, res) => {
  const user = req.user;

  res.status(200).json({
    success: true,
    message: "Profile retrieved successfully",
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    },
  });
};

const updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.validated.body;

  const result = await changePassword(
    req.user._id,
    currentPassword,
    newPassword
  );

  res.status(200).json({
    success: true,
    message: result.message,
  });
};

const logout = async (req, res) => {
  clearAuthCookie(res);

  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
};

module.exports = {
  register,
  login,
  getMe,
  updatePassword,
  logout,
};