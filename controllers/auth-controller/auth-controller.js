const User = require("../../models/user-model");
const Otp = require("../../models/otp-model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { generateOtp } = require("../../utils/generate-otp");
const {
  createNodemailTransporter,
  getMailOptions,
} = require("../../utils/nodemailer");

const sendOTP = async (req, res) => {
  let { email } = req.body;
  if (!email) res.status(401).json({ errorText: "Email is not entered" });
  const transporter = createNodemailTransporter();
  const OTP = generateOtp();
  try {
    await Otp.deleteMany({ email });
    await Otp.create({ email, OTP });
    await transporter.sendMail(getMailOptions(email, OTP));
    res.status(200).json({ message: "Otp sent on your email" });
  } catch (error) {
    res.status(400).json({ errorText: "Failed to send the OTP" });
  }
};

const verifyOtp = async (req, res) => {
  const { email, userName, otp: userEnteredOTP } = req.body;
  if (!email || !userName || !userEnteredOTP)
    if (!email)
      res.status(400).json({ errorText: "Please fill all the fields" });
  const storedOtpDetails = await Otp.findOne({ email });
  if (storedOtpDetails && storedOtpDetails.OTP === userEnteredOTP) {
    await Otp.deleteMany({ email });
    res.status(200).json({ message: "OTP Verified Successfully" });
  } else {
    res.status(401).json({ errorText: "Invalid OTP" });
  }
};

// const signUpUser = async (req, res) => {
//   try {
//     console.log(req.body);
//     const { email, password } = req.body;

//     const isUserExist = await User.findOne({ email });
//     if (isUserExist !== null) {
//       return res.status(403).json({
//         message: "Account already exists for this email",
//       });
//     }

//     hashedPassword = await bcrypt.hash(password, 12);

//     const NewUser = new User({
//       ...req.body,
//       password: hashedPassword,
//     });

//     await NewUser.save();

//     const token = generateToken(NewUser._id);

//     res.status(201).json({
//       response: {
//         NewUser,
//         token,
//       },
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       message: "Something went wrong!",
//       errorMessage: error.message,
//     });
//   }
// };

// const signInUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });
//     if (!user) {
//       res.status(403).json({ message: "Email or password is incorrect!" });
//     } else {
//       bcrypt
//         .compare(password, user.password)
//         .then((matched) => {
//           if (matched) {
//             const token = jwt.sign({ _id: user._id }, JWT_SECRET);
//             res.status(201).json({
//               response: {
//                 user,
//                 token,
//               },
//             });
//           } else {
//             res.status(403).json({ message: "Password is incorrect!" });
//           }
//         })

//         .catch((error) => {
//           console.log(error);
//           res.status(403).json({ message: "Email or password is incorrect!" });
//         });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       message: "Something went wrong!",
//       errorMessage: error.message,
//     });
//   }
// };

module.exports = {
  sendOTP,
  verifyOtp,
  // signInUser,
};
