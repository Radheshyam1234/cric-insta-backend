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
  if (!emailPattern.test(email))
    return res.status(401).json({ errorText: "Enter a valid email" });

  const transporter = createNodemailTransporter();
  const OTP = generateOtp();

  try {
    await Otp.deleteMany({ email });
    await Otp.create({ email, OTP });
    await transporter.sendMail(getMailOptions(email, OTP));
    return res.status(200).json({ message: "Otp sent on your email" });
  } catch (error) {
    return res.status(500).json({ errorText: "Failed to send the OTP" });
  }
};

const verifyOtp = async (req, res) => {
  const { otp: userEnteredOTP, signUpInfo } = req.body;
  const { requestType } = req.query;

  if (!emailPattern.test(signUpInfo?.email) || !userEnteredOTP)
    return res.status(400).json({ errorText: "Please fill all the fields" });

  const storedOtpDetails = await Otp.findOne({ email: signUpInfo.email });

  if (storedOtpDetails && storedOtpDetails.OTP === userEnteredOTP) {
    await Otp.deleteMany({ email: signUpInfo.email });
    if (requestType === "create user") {
      await signUpUser(req, res);
    }
    // return res.status(200).json({ message: "OTP Verified Successfully" });
  } else {
    return res.status(401).json({ errorText: "Invalid OTP" });
  }
};

const signUpUser = async (req, res) => {
  const {
    signUpInfo,
    signUpInfo: { email, userName, password },
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
      ...signUpInfo,
      password: hashedPassword,
    });
    await NewUser.save();

    const sanitizedUser = await User.findById(NewUser._id).select("-password");
    const token = generateToken(NewUser._id);
    return res.status(201).json({
      response: {
        user: sanitizedUser,
        token,
      },
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
              response: {
                user: sanitizedUser,
                token,
              },
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

module.exports = {
  sendOTP,
  verifyOtp,
  signInUser,
};
