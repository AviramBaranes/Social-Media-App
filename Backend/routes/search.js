const express = require("express");

const router = express.Router();

const authMiddlewere = require("../middleware/authMiddleware");
const searchController = require("../controller/search");

router.get("/:searchedName", authMiddlewere, searchController.searchUser);

module.exports = router;
