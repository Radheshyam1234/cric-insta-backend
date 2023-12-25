const mongoose = require("mongoose");

const OTPSchema = new mongoose.Schema({
  email: String,
  OTP: String,
  createdAt: { type: Date, default: Date.now(), expires: "2m" },
});

const Otp = mongoose.model("Otp", OTPSchema);
module.exports = Otp;
