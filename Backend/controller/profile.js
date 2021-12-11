const Profile = require("../models/Profile");
const Follower = require("../models/Follower");
const User = require("../models/User");
const Post = require("../models/Post");
const notificationsActions = require("../../utilsServer/notificationActions");

const bcrypt = require("bcryptjs");

exports.getByUsername = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username: username.toLowerCase() });

    if (!user) {
      return res.status(404).send("User not exist");
    }

    const profile = await Profile.findOne({ user: user._id }).populate("user");

    const profileFollowerStats = await Follower.findOne({ user: user._id });

    return res.json({
      profile,
      followersLength:
        profileFollowerStats.followers.length > 0
          ? profileFollowerStats.followers.length
          : 0,
      followingsLength:
        profileFollowerStats.following.length > 0
          ? profileFollowerStats.following.length
          : 0,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send("Server Error");
  }
};

exports.getUserPosts = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username: username.toLowerCase() });

    if (!user) {
      return res.status(404).send("User does not exist");
    }

    const posts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate("user")
      .populate("comments.user");

    return res.json(posts);
  } catch (err) {
    console.log(err);
    return res.status(500).send("Server Error");
  }
};

exports.getFollowers = async (req, res) => {
  const { userId } = req.params;

  try {
    const followers = await Follower.findOne({ user: userId }).populate(
      "followers.user"
    );

    return res.json(followers.followers);
  } catch (err) {
    console.log(err);
    return res.status(500).send("Server Error");
  }
};

exports.getFollowings = async (req, res) => {
  const { userId } = req.params;

  try {
    const followings = await Follower.findOne({ user: userId }).populate(
      "following.user"
    );

    return res.json(followings.following);
  } catch (err) {
    console.log(err);
    return res.status(500).send("Server Error");
  }
};

exports.followUser = async (req, res) => {
  const { userId } = req;
  const { toFollowUserId } = req.params;

  try {
    const user = await Follower.findOne({ user: userId });
    const userToFollow = await Follower.findOne({ user: toFollowUserId });

    if (!user || !userToFollow) {
      return res.status(404).send("User Not Found");
    }

    const alreadyFollow =
      user.following.length > 0 &&
      user.following.some(
        (aFollowing) => aFollowing.user.toString() === toFollowUserId
      );

    if (alreadyFollow) {
      return res.status(401).send("User Already Follow");
    }

    user.following.unshift({ user: toFollowUserId });
    await user.save();

    userToFollow.followers.unshift({ user: userId });
    await userToFollow.save();

    await notificationsActions.newFollowerNotifications(userId, toFollowUserId);

    return res.status(200).send("Success");
  } catch (err) {
    console.log(err);
    return res.status(500).send("Server Error");
  }
};

exports.unfollowUser = async (req, res) => {
  const { userId } = req;
  const { toUnfollowUserId } = req.params;

  try {
    const user = await Follower.findOne({ user: userId });
    const userToUnFollow = await Follower.findOne({ user: toUnfollowUserId });

    if (!user || !userToUnFollow) {
      return res.status(404).send("User Not Found");
    }

    const alreadyFollow =
      user.following.length > 0 &&
      user.following.some(
        (aFollowing) => aFollowing.user.toString() === toUnfollowUserId
      );

    if (!alreadyFollow) {
      return res.status(401).send("User is yet to follow");
    }

    const removeFollowingIndex = user.following.findIndex(
      (aFollowing) => aFollowing.user.toString() === toUnfollowUserId
    );

    user.following.splice(removeFollowingIndex, 1);
    await user.save();

    const removeFollowersndex = userToUnFollow.followers.findIndex(
      (aFollower) => aFollower.user.toString() === userId
    );

    userToUnFollow.followers.splice(removeFollowersndex, 1);
    await userToUnFollow.save();

    await notificationsActions.removeFollowerNotification(
      userId,
      toUnfollowUserId
    );

    return res.status(200).send("Success");
  } catch (err) {
    console.log(err);
    return res.status(500).send("Server Error");
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { userId } = req;

    const { bio, facebook, youtube, twitter, instagram, profilePicUrl } =
      req.body;

    let profileFields = {};

    profileFields.user = userId;

    profileFields.bio = bio;

    profileFields.social = {};

    if (facebook) profileFields.social.facebook = facebook;
    if (youtube) profileFields.social.youtube = youtube;
    if (instagram) profileFields.social.instagram = instagram;
    if (twitter) profileFields.social.twitter = twitter;

    await Profile.findOneAndUpdate(
      { user: userId },
      { $set: profileFields },
      { new: true }
    );

    if (profilePicUrl) {
      const user = await User.findById(userId);
      user.profilePicUrl = profilePicUrl;
      await user.save();
    }

    return res.status(200).send("success");
  } catch (err) {
    console.log(err);
    return res.status(500).sens("Server Error");
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { userId } = req;

    if (newPassword.length < 6) {
      return res.status(401).send("Password too short");
    }

    const user = await User.findById(userId).select("+password");

    const isPassword = await bcrypt.compare(currentPassword, user.password);

    if (!isPassword) {
      return res.status(401).send("Invalid Password");
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).send("success");
  } catch (err) {
    console.log(err);
    return res.status(500).sens("Server Error");
  }
};

exports.updateMessagePopupSettings = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    user.newMessagePopup = !user.newMessagePopup;
    await user.save();

    return res.status(200).send("success");
  } catch (err) {
    console.log(err);
    return res.status(500).sens("Server Error");
  }
};
