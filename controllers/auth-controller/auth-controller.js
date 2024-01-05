const User = require("../../models/user-model");
const Otp = require("../../models/otp-model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { generateOtp } = require("../../utils/generate-otp");
const {
  createNodemailTransporter,
  getMailOptions,
} = require("../../utils/nodemailer");
const { generateToken } = require("../../utils/generate-token");
require("dotenv").config();

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sendOTP = async (req, res) => {
  let { email } = req.body;
  const { requestType } = req.query;

  if (!emailPattern.test(email))
    return res.status(401).json({ errorText: "Enter a valid email" });

  if (requestType === "create user") {
    const isUserExist = await User.findOne({ email });
    if (isUserExist) {
      return res.status(403).json({
        message: "Account already exists for this email",
      });
    }
  }

  const transporter = createNodemailTransporter();
  const OTP = generateOtp();

  try {
    if (requestType === "reset password") {
      // Check if user exists with this email or not
      const userExists = await User.findOne({ email });
      if (!userExists)
        return res.status(404).json({ errorText: "Email is not registered" });
    }

    await Otp.deleteMany({ email });
    await Otp.create({ email, OTP });
    await transporter.sendMail(getMailOptions(email, OTP));
    return res.status(200).json({ message: "Otp sent on your email" });
  } catch (error) {
    return res.status(500).json({ errorText: "Failed to send the OTP" });
  }
};

const verifyOtp = async (req, res) => {
  const { otp: userEnteredOTP, userInfo } = req.body;
  const { requestType } = req.query;

  if (!emailPattern.test(userInfo?.email) || !userEnteredOTP)
    return res.status(400).json({ errorText: "Please fill all the fields" });

  const storedOtpDetails = await Otp.findOne({ email: userInfo.email });

  if (storedOtpDetails && storedOtpDetails.OTP === userEnteredOTP) {
    // await Otp.deleteMany({ email: userInfo.email });
    if (requestType === "create user") {
      await signUpUser(req, res);
    } else if (requestType === "reset password") {
      return res.status(200).json({ message: "OTP Verified Successfully" });
    }
  } else {
    return res.status(401).json({ errorText: "Invalid OTP" });
  }
};

const signUpUser = async (req, res) => {
  const {
    userInfo,
    userInfo: { email, userName, password },
  } = req.body;

  try {
    if (!emailPattern.test(email) || !userName || !password)
      return res
        .status(401)
        .json({ errorText: "Fill all fields or a valid email" });

    const isUserExist = await User.findOne({ email });
    if (isUserExist) {
      return res.status(403).json({
        message: "Account already exists for this email",
      });
    }

    hashedPassword = await bcrypt.hash(password, 12);
    const NewUser = new User({
      ...userInfo,
      password: hashedPassword,
    });
    await NewUser.save();

    const sanitizedUser = await User.findById(NewUser._id).select("-password");
    const token = generateToken(NewUser._id);
    return res.status(201).json({
      user: sanitizedUser,
      token,
    });
  } catch (error) {
    console.log(error, "85");
    return res.status(500).json({
      errorText: "Failed to create the user!",
    });
  }
};

const signInUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(403)
        .json({ errorText: "Email or password is incorrect!" });
    } else {
      bcrypt
        .compare(password, user.password)
        .then(async (matched) => {
          if (matched) {
            const token = jwt.sign(
              { _id: user._id },
              process.env.JWT_ACCESS_SECRET
            );
            const sanitizedUser = await User.findById(user._id).select(
              "-password"
            );
            return res.status(201).json({
              user: sanitizedUser,
              token,
            });
          } else {
            throw new Error("Password is incorrect!");
          }
        })
        .catch((error) => {
          return res
            .status(403)
            .json({ errorText: "Email or password is incorrect!" });
        });
    }
  } catch (error) {
    return res.status(500).json({
      errorText: "Something went wrong!! Please refresh and try again..",
    });
  }
};

const resetPassword = async (req, res) => {
  const { email, password } = req.body;
  if (password.length < 4)
    return res
      .status(401)
      .json({ errorText: "Password must have at least 4 characters" });
  else {
    hashedPassword = await bcrypt.hash(password, 12);
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { $set: { password: hashedPassword } },
      {
        new: true,
      }
    );
    if (!updatedUser)
      return res.status(403).json({ errorText: "No User Exist" });
    else {
      const token = jwt.sign(
        { _id: updatedUser._id },
        process.env.JWT_ACCESS_SECRET
      );
      const sanitizedUser = await User.findById(updatedUser._id).select(
        "-password"
      );
      return res.status(201).json({
        user: sanitizedUser,
        token,
      });
    }
  }
};

module.exports = {
  sendOTP,
  verifyOtp,
  signInUser,
  resetPassword,
};
