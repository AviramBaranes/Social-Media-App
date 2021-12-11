const User = require("../models/User");

exports.searchUser = async (req, res) => {
  const { searchedName } = req.params;

  const { userId } = req;

  if (searchedName.length === 0) return;

  try {
    const results = await User.find({
      name: { $regex: searchedName, $options: "i" },
    });

    const resultsToBeSent =
      results.length > 0 &&
      results.filter((result) => result._id.toString() !== userId);

    res.json(resultsToBeSent);
  } catch (err) {
    console.log(err);
    res.status(500).send("server error");
  }
};
