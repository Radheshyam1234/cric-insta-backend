const User = require("../models/UserModel");
const { verifyAccessToken } = require("../services/token-services");
const authenticate = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    const { refreshToken } = req.cookies();
    if (!authorization) {
      throw new Error();
    }
    const accessToken = authorization.replace("Bearer ", "");

    const userData = await verifyAccessToken(accessToken);
    if (!userData) throw new Error();
    req.user = User.findById(userData._id);
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ errorText: "Invalid Token" });
  }
};

module.exports = authenticate;
