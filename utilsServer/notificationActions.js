const User = require("../Backend/models/User");
const Notifications = require("../Backend/models/Notification");
const socket = require("../socket").getIo();
const { findConnectedUser } = require("./roomActions");

const setNotificationToUnread = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user.unreadNotification) {
      user.unreadNotification = true;
      await user.save();
    }

    return;
  } catch (err) {
    console.log(err);
  }
};

exports.newLikeNotification = async (userId, postId, userToNotifyId) => {
  try {
    const userToNotify = await Notifications.findOne({ user: userToNotifyId });

    const newNotification = {
      type: "newLike",
      user: userId,
      post: postId,
      date: Date.now(),
    };

    userToNotify.notifications.unshift(newNotification);
    await userToNotify.save();

    await setNotificationToUnread(userToNotifyId);

    const userSocket = findConnectedUser(userToNotifyId).socketId;

    if (userSocket && socket) {
      const user = await User.findById(userId);

      socket
        .to(userSocket)
        .emit("newLike", {
          name: user.name,
          profilePicUrl: user.profilePicUrl,
          username: user.username,
          postId,
        });
    }

    return;
  } catch (err) {
    console.log(err);
  }
};

exports.removeLikeNotification = async (userId, postId, userToNotifyId) => {
  try {
    const notificationModel = await Notifications.findOne({
      user: userToNotifyId,
    });

    const notificationIndex = notificationModel.notifications.findIndex(
      (notification) =>
        notification.type === "newLike" &&
        notification.user.toString() === userId &&
        notification.post.toString() === postId
    );

    notificationModel.notifications.splice(notificationIndex, 1);
    notificationModel.save();

    return;
  } catch (err) {
    console.log(err);
  }
};

exports.newCommentNotification = async (
  postId,
  commentId,
  userId,
  userToNotifyId,
  text
) => {
  try {
    const userToNotify = await Notifications.findOne({ user: userToNotifyId });

    const newNotification = {
      type: "newComment",
      user: userId,
      post: postId,
      commentId,
      text,
      date: Date.now(),
    };

    await userToNotify.notifications.unshift(newNotification);
    await userToNotify.save();

    await setNotificationToUnread(userToNotifyId);

    return;
  } catch (err) {
    console.log(err);
  }
};

exports.removeCommentNotification = async (
  postId,
  commentId,
  userId,
  userToNotifyId
) => {
  try {
    const notificationModel = await Notifications.findOne({
      user: userToNotifyId,
    });

    const notificationIndex = notificationModel.notifications.findIndex(
      (notification) =>
        notification.type === "newComment" &&
        notification.user.toString() === userId &&
        notification.post.toString() === postId &&
        notification.commentId === commentId
    );
    if (notificationIndex === -1) return;

    notificationModel.notifications.splice(notificationIndex, 1);
    notificationModel.save();

    return;
  } catch (err) {
    console.log(err);
  }
};

exports.newFollowerNotifications = async (userId, userToNotifyId) => {
  try {
    const userToNotify = await Notifications.findOne({ user: userToNotifyId });

    const newFollowerNotification = {
      type: "newFollower",
      user: userId,
      date: Date.now(),
    };

    userToNotify.notifications.unshift(newFollowerNotification);
    await userToNotify.save();

    await setNotificationToUnread(userToNotify);

    return;
  } catch (err) {
    console.log(err);
  }
};

// using mongoose '$pull' operator
exports.removeFollowerNotification = async (userId, userToNotifyId) => {
  try {
    await Notifications.findOneAndUpdate(
      { user: userToNotifyId },
      {
        $pull: { notifications: { type: "newFollower", user: userId } },
      }
    );

    return;
  } catch (err) {
    console.log(err);
  }
};
