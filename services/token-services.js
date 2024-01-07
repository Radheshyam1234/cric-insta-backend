const jwt = require("jsonwebtoken");
const RefreshToken = require("../models/refresh-token-model");
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

const storeRefreshToken = async (token, userId) => {
  try {
    await RefreshToken.create({
      token,
      userId,
    });
  } catch (error) {
    throw new Error();
  }
};

const verifyAccessToken = async (token) => {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
};

module.exports = { generateToken, storeRefreshToken, verifyAccessToken };
