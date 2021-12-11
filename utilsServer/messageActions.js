const ChatModel = require("../Backend/models/Chat");
const User = require("../Backend/models/User");

exports.loadMessages = async (userId, messageWith) => {
  try {
    const user = await ChatModel.findOne({ user: userId }).populate(
      "chats.messageWith"
    );

    const chat = user.chats.find(
      (chat) => chat.messageWith._id.toString() === messageWith
    );

    if (!chat) return { error: "No Chat Found" };

    return { chat };
  } catch (error) {
    console.log(error);
    return { error };
  }
};

exports.sendMsg = async (sender, receiver, msg) => {
  try {
    const newMsg = {
      msg,
      sender,
      receiver,
      date: Date.now(),
    };

    const pushMsg = async (chatModelToPush, receiver) => {
      const chat = chatModelToPush.chats.find(
        (chat) => chat.messageWith.toString() === receiver
      );

      if (chat) {
        chat.messages.push(newMsg);
        await chatModelToPush.save();
      } else {
        const newChat = {
          messageWith: receiver,
          messages: [newMsg],
        };
        chatModelToPush.chats.push(newChat);
        await chatModelToPush.save();
      }
      return newMsg;
    };

    const user = await ChatModel.findOne({ user: sender });
    const recieverModel = await ChatModel.findOne({ user: receiver });

    await pushMsg(user, receiver);
    await pushMsg(recieverModel, sender);

    return { newMsg };
  } catch (error) {
    console.log(error);
    return { error };
  }
};

exports.setMsgToUnread = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user.unreadMessage) {
      user.unreadMessage = true;
      user.save();
    }
    return;
  } catch (error) {
    console.log(error);
  }
};

exports.deleteMsg = async (userId, messageWith, messageId) => {
  try {
    const user = await ChatModel.findOne({ user: userId });

    const chat = user.chats.find(
      (chat) => chat.messageWith.toString() === messageWith
    );

    if (!chat) return;

    const msgIndex = chat.messages.findIndex(
      (msg) => msg._id.toString() === messageId
    );

    if (msgIndex === -1) return;

    chat.messages.splice(msgIndex, 1);

    await user.save();

    return { success: true };
  } catch (error) {
    console.log(error);
  }
};
