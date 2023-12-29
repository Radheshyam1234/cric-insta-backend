const express = require("express");
const router = express.Router();

const {
  signInUser,
  sendOTP,
  verifyOtp,
  resetPassword,
} = require("../controllers/auth-controller/auth-controller");

router.route("/login").post(signInUser);
router.route("/sendotp").post(sendOTP);
router.route("/verifyotp").post(verifyOtp);
router.route("/reset-password").post(resetPassword);

module.exports = router;
