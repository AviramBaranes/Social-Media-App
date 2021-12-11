// const User = require("mongoose").model("User").schema;
const User = require("../models/User");
const FollowersModel = require("../models/Follower");
const Notification = require("../models/Notification");
const Chat = require("../models/Chat");

const bycrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const isEmail = require("validator/lib/isEmail");

exports.getUser = async (req, res) => {
  const { userId } = req;

  try {
    const user = await User.findById(userId);

    const userFollowersStats = await FollowersModel.findOne({ user: userId });

    return res.status(200).json({ user, userFollowersStats });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body.user;

  if (!isEmail(email)) return res.status(401).send("Invalid Email");

  if (password.length < 6) {
    return res.status(401).send("Password to short");
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );

    if (!user) {
      return res.status(401).send("Invalid Credentials");
    }

    const isPassword = await bycrypt.compare(password, user.password);

    if (!isPassword) {
      return res.status(401).send("Invalid Credenrials");
    }

    const userChat = await Chat.findOne({ user: user._id });

    if (!userChat) {
      await new Chat({ user: user._id, chat: [] }).save();
    }

    const payload = { userId: user._id };
    jwt.sign(
      payload,
      process.env.jwtSecret,
      { expiresIn: "2d" },
      (err, token) => {
        if (err) throw err;
        res.status(200).json({ token, message: "success" });
      }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).send("server error");
  }
};
