const ChatModel = require("../models/Chat");
const User = require("../models/User");

exports.getAllChats = async (req, res) => {
  try {
    const { userId } = req;

    const userChat = await ChatModel.findOne({ user: userId }).populate(
      "chats.messageWith"
    );
    console.log(123456, userChat);
    let chatsToBeSent = [];

    if (userChat.chats.length > 0) {
      chatsToBeSent = userChat.chats.map((chat) => ({
        messageWith: chat.messageWith._id,
        name: chat.messageWith.name,
        profilePicUrl: chat.messageWith.profilePicUrl,
        lastMessage: chat.messages[chat.messages.length - 1].msg,
        date: chat.messages[chat.messages.length - 1].date,
      }));
    }

    return res.json(chatsToBeSent);
  } catch (err) {
    console.log(err);
    return res.status(500).send("Server Error");
  }
};

exports.getUserInfo = async (req, res) => {
  try {
    const { userToFindId } = req.params;

    const user = await User.findById(userToFindId);

    if (!user) {
      return res.status(404).send("User not found");
    }

    return res.json({ name: user.name, profilePicUrl: user.profilePicUrl });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server Error");
  }
};

exports.deleteChat = async (req, res) => {
  try {
    const { messageWith } = req.params;

    const { userId } = req;

    const user = await ChatModel.findOne({ user: userId });

    if (!user) return res.status(401).send("Chat Not Found");

    const chatIndex = user.chats.findIndex(
      (chat) => chat.messageWith.toString() === messageWith
    );

    if (chatIndex === -1) return res.status(401).send("Chat Not Found");

    user.chats.splice(chatIndex, 1);

    await user.save();

    return res.status(200).send("Success");
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server Error");
  }
};
