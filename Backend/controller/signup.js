const User = require("../models/User");
const Profile = require("../models/Profile");
const Follower = require("../models/Follower");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const isEmail = require("validator/lib/isEmail");
const userPng =
  "https://res.cloudinary.com/indersingh/image/upload/v1593464618/App/user_mklcpl.png";

const regexUserName = /^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$/;

exports.checkUsername = async (req, res) => {
  const { username } = req.params;
  try {
    if (username.length < 1) return res.status(401).send("Invalid");
    if (!regexUserName.test(username)) return res.status(401).send("Invalid");

    const user = await User.findOne({ username: username.toLowerCase() });

    if (user) return res.status(401).send("User Already Taken");

    return res.status(200).send("Username Availeble");
  } catch (err) {
    console.log(err);
    return res.status(500).send("Server Error");
  }
};

exports.signup = async (req, res) => {
  const {
    name,
    email,
    password,
    username,
    bio,
    facebook,
    youtube,
    twitter,
    instagram,
  } = req.body.user;

  if (!isEmail(email)) return res.status(401).send("Invalid Email");
  if (password.length < 6) {
    return res.status(401).send("Password must be at least 6 characters");
  }
  try {
    let user;
    user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      return res.status(401).send("User already exist");
    }

    const bcryptPassword = await bcrypt.hash(password, 10);

    user = new User({
      name,
      email: email.toLowerCase(),
      password: bcryptPassword,
      username: username.toLowerCase(),
      profilePicUrl: req.body.profilePicUrl || userPng,
    });
    await user.save();

    let profileFields = {};
    profileFields.user = user._id;

    profileFields.bio = bio;

    profileFields.social = {};
    if (facebook) profileFields.social.facebook = facebook;
    if (youtube) profileFields.social.youtube = youtube;
    if (instagram) profileFields.social.instagram = instagram;
    if (twitter) profileFields.social.twitter = twitter;

    await new Profile(profileFields).save();
    await new Follower({
      user: user._id,
      followers: [],
      following: [],
    }).save();

    const payload = { userId: user._id };
    jwt.sign(
      payload,
      process.env.jwtSecret,
      { expiresIn: "2d" },
      (err, token) => {
        if (err) throw err;
        return res.status(200).json(token);
      }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).send("Server Error");
  }
};
