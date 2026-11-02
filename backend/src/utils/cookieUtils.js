const setAuthCookie = (res, token) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge:
      Number(process.env.COOKIE_EXPIRES_IN || 1) *
      24 *
      60 *
      60 *
      1000,
  };

  res.cookie("token", token, cookieOptions);
};

const clearAuthCookie = (res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
};

module.exports = {
  setAuthCookie,
  clearAuthCookie,
};