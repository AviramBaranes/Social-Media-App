const User = require("../models/User");
const Notification = require("../models/Notification");

exports.getNotifications = async (req, res) => {
  try {
    const { userId } = req;

    const user = await Notification.findOne({ user: userId })
      .populate("notifications.user")
      .populate("notifications.post");

    return res.json(user.notifications);
  } catch (err) {
    console.log(err);
    return res.status(500).send("Server Error");
  }
};

exports.changeUnreadNotification = async (req, res) => {
  try {
    const { userId } = req;

    const user = await User.findById(userId);

    if (user.unreadNotification) {
      user.unreadNotification = false;
      await user.save();
    }

    return res.status(200).send("Updated");
  } catch (err) {
    console.log(err);
    return res.status(500).send("Server Error");
  }
};
