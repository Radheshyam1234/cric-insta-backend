const otpGenerator = require("otp-generator");

const generateOtp = () => {
  return otpGenerator.generate(6, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
};

module.exports = { generateOtp };
