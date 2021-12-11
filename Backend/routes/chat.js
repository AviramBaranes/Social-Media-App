const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const chatController = require("../controller/chat");

router.get("/", authMiddleware, chatController.getAllChats);

router.get("/user/:userToFindId", authMiddleware, chatController.getUserInfo);

router.delete("/:messageWith", authMiddleware, chatController.deleteChat);

module.exports = router;
