const express = require("express");

const router = express.Router();

const resetController = require("../controller/reset");

router.post("/", resetController.sentResetEmail);

router.post("/token", resetController.resetPassword);

module.exports = router;
