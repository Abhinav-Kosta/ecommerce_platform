const { registerUser } = require("../services/authService");

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

module.exports = {
  register,
};