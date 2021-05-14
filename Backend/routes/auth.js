const express = require("express");

const router = express.Router();

const authController = require("../controller/auth");
const authMiddlewere = require("../middleware/authMiddleware");

router.get("/", authMiddlewere, authController.getUser);
router.post("/", authController.login);

module.exports = router;
