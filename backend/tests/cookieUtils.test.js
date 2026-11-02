const {
  setAuthCookie,
  clearAuthCookie,
} = require("../src/utils/cookieUtils");

describe("Cookie utilities", () => {
  let res;

  beforeEach(() => {
    res = {
      cookie: jest.fn(),
      clearCookie: jest.fn(),
    };

    process.env.NODE_ENV = "development";
    process.env.COOKIE_EXPIRES_IN = "1";
  });

  it("sets an HttpOnly authentication cookie", () => {
    setAuthCookie(res, "mock-jwt-token");

    expect(res.cookie).toHaveBeenCalledWith(
      "token",
      "mock-jwt-token",
      {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 86400000,
      }
    );
  });

  it("sets secure cookie in production", () => {
    process.env.NODE_ENV = "production";

    setAuthCookie(res, "mock-jwt-token");

    expect(res.cookie).toHaveBeenCalledWith(
      "token",
      "mock-jwt-token",
      expect.objectContaining({
        httpOnly: true,
        secure: true,
        sameSite: "lax",
      })
    );
  });

  it("clears the authentication cookie", () => {
    clearAuthCookie(res);

    expect(res.clearCookie).toHaveBeenCalledWith(
      "token",
      {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
      }
    );
  });
});