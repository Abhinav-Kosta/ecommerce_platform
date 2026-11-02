jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
}));

const jwt = require("jsonwebtoken");
const { generateToken } = require("../src/utils/tokenUtils");

describe("Token utilities", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";
    process.env.JWT_EXPIRES_IN = "1d";
  });

  it("generates a JWT with the user ID and configured expiry", () => {
    jwt.sign.mockReturnValue("mock-jwt-token");

    const token = generateToken("user123");

    expect(jwt.sign).toHaveBeenCalledWith(
      { id: "user123" },
      "test-secret",
      { expiresIn: "1d" }
    );

    expect(token).toBe("mock-jwt-token");
  });

  it("uses the default expiry when JWT_EXPIRES_IN is missing", () => {
    delete process.env.JWT_EXPIRES_IN;
    jwt.sign.mockReturnValue("mock-jwt-token");

    generateToken("user123");

    expect(jwt.sign).toHaveBeenCalledWith(
      { id: "user123" },
      "test-secret",
      { expiresIn: "1d" }
    );
  });
});