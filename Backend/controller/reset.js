const User = require("../models/User");

const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const isEmail = require("validator/lib/isEmail");
const nodemailer = require("nodemailer");
const sendGridTransport = require("nodemailer-sendgrid-transport");
const baseUrl = require("../../utils/baseUrl");

const transporter = nodemailer.createTransport(
  sendGridTransport({
    auth: {
      api_key: process.env.sendGrid_api,
    },
  })
);

exports.sentResetEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!isEmail(email)) return res.status(404).send("Email is not valid");

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) return res.status(404).send("User not found");

    const token = crypto.randomBytes(32).toString("hex");

    user.resetToken = token;
    user.expireToken = Date.now() + 3600000;

    await user.save();

    const href = `${baseUrl}/reset/${token}`;

    const emailOptions = {
      to: user.email,
      from: "aviram111101@walla.co.il",
      subject: "Hi there! Password reset request",
      html: `<p>Hey ${user.name
        .split(" ")[0]
        .toString()}, There was a request for password reset. <a href=${href}>Click this link to reset the password </a>   </p>
              <p>This token is valid for only 1 hour.</p>`,
    };

    transporter.sendMail(emailOptions, (err, info) => err && console.log(err));

    return res.status(200).send("Email sent!");
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server Error");
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token) return res.status(401).send("Unauthorized");

    if (password.length < 6) return res.status(401).send("Password to short");

    const user = await User.findOne({ resetToken: token });

    if (!user) return res.status(401).send("User not found");

    if (Date.now() > user.expireToken)
      return res.status(401).send("token expired");

    user.password = await bcrypt.hash(password, 10);

    user.token = "";
    user.expireToken = undefined;

    await user.save();

    return res.status(200).send("Password reseted");
  } catch (err) {
    console.log(err);
    return res.status(500).send("Server Error");
  }
};
