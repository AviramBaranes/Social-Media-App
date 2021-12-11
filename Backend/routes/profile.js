const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const profileController = require("../controller/profile");

router.get("/:username", authMiddleware, profileController.getByUsername);

router.get("/posts/:username", authMiddleware, profileController.getUserPosts);

router.get(
  "/followers/:userId",
  authMiddleware,
  profileController.getFollowers
);

router.get(
  "/following/:userId",
  authMiddleware,
  profileController.getFollowings
);

router.post(
  "/follow/:toFollowUserId",
  authMiddleware,
  profileController.followUser
);

router.put(
  "/unfollow/:toUnfollowUserId",
  authMiddleware,
  profileController.unfollowUser
);

router.post("/update", authMiddleware, profileController.updateProfile);

router.post(
  "/settings/password",
  authMiddleware,
  profileController.updatePassword
);

router.post(
  "setting/messagePopup",
  authMiddleware,
  profileController.updateMessagePopupSettings
);

module.exports = router;
