const express = require("express");

const router = express.Router();

const signupController = require("../controller/signup");

router.get("/:username", signupController.checkUsername);

router.post("/", signupController.signup);

module.exports = router;
