const express = require("express");
const router = express.Router();

const {
  sendOTP,
  verifyOtp,
  signUpUser,
} = require("../controllers/auth-controller/auth-controller");

// router.route("/signup").post(signUpUser);
router.route("/sendotp").post(sendOTP);
router.route("/verifyotp").post(verifyOtp);

module.exports = router;
