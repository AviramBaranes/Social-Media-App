const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const notificationsController = require("../controller/notifications");

router.get("/", authMiddleware, notificationsController.getNotifications);

router.post(
  "/",
  authMiddleware,
  notificationsController.changeUnreadNotification
);

module.exports = router;
