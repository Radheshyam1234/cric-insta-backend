const jwt = require("jsonwebtoken");
require("dotenv").config();

const generateToken = (userId) => {
  const accessToken = jwt.sign({ _id: userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "1h",
  });
  const refreshToken = jwt.sign(
    { _id: userId },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: "1y",
    }
  );
  return { accessToken, refreshToken };
};

module.exports = { generateToken };
