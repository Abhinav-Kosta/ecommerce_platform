const { registerUser, loginUser } = require("../services/authService");

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

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: { user },
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
  logout,
};