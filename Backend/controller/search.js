const User = require("../models/User");

exports.searchUser = async (req, res) => {
  const { searchedName } = req.params;

  if (searchedName.length === 0) return;

  try {
    const result = await User.find({
      name: { $regex: searchedName, $options: "i" },
    });
    console.log(`results---------------------${result}`);
    res.json(result);
  } catch (err) {
    console.log(err);
    res.status(500).send("server error");
  }
};
