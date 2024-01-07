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
const UserDto = require("../../dtos/user-dto");
require("dotenv").config();

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ----------------------- Send OTP ------------------------------------- */

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

/* ----------------------- Verify OTP ------------------------------------- */

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

/* ----------------------- Signup after OTP verification ------------------------------------- */

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

    const newUserData = await User.findById(NewUser._id);
    const userData = new UserDto(newUserData);
    const { accessToken, refreshToken } = generateToken(NewUser._id);
    res.cookie("refreshtoken", refreshToken, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: true,
    });
    return res.status(201).json({
      user: userData,
      token: accessToken,
    });
  } catch (error) {
    console.log(error, "85");
    return res.status(500).json({
      errorText: "Failed to create the user!",
    });
  }
};

/* ----------------------- SignIn with Email ------------------------------------- */

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
            const userData = new UserDto(user);
            const { accessToken, refreshToken } = generateToken(user._id);
            res.cookie("refreshtoken", refreshToken, {
              maxAge: 1000 * 60 * 60 * 24 * 30,
              httpOnly: true,
            });
            return res.status(201).json({
              user: userData,
              token: accessToken,
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

/** ----------------------- Reset Password ------------------------------------- */

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
      const userData = new UserDto(updatedUser);
      const { accessToken, refreshToken } = generateToken(updatedUser._id);
      res.cookie("refreshtoken", refreshToken, {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true,
      });
      return res.status(201).json({
        user: userData,
        token: accessToken,
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
