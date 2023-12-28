const jwt = require("jsonwebtoken");
require("dotenv").config();

const generateToken = (userId) => {
  const token = jwt.sign({ _id: userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "1h",
  });
  return token;
};

module.exports = { generateToken };
