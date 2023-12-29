const express = require("express");
const router = express.Router();

const {
  signInUser,
  sendOTP,
  verifyOtp,
} = require("../controllers/auth-controller/auth-controller");

router.route("/login").post(signInUser);
router.route("/sendotp").post(sendOTP);
router.route("/verifyotp").post(verifyOtp);

module.exports = router;
