const nodemailer = require("nodemailer");
require("dotenv").config();

const createNodemailTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

const getMailOptions = (email, OTP) => {
  return {
    from: "gamersadda863@gmail.com",
    to: email,
    subject: "Your OTP",
    html: `
    <div style="font-family: Helvetica,Arial,sans-serif;overflow:auto;line-height:2">
  <div style="margin:10px auto;width:70%;padding:20px 0">
    <div style="border-bottom:1px solid #eee">
      <a
        href="https://cric-insta-frontend.vercel.app/"
        style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600"
      >
        CricInsta
      </a>
    </div>
    <p style="font-size:1.1em">Hi,</p>
    <p>
      Thank you for choosing CricInsta. Use the following OTP to complete your
      process. OTP is valid for 2 minutes
    </p>
    <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">
      ${OTP}
    </h2>
    <p style="font-size:0.9em;">
      Regards,
      <br />
      CricInsta
    </p>
  </div>
</div>
`,
  };
};

const mailOptions = (module.exports = {
  createNodemailTransporter,
  getMailOptions,
});
