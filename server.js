const express = require('express');
const http = require('http');
const next = require('next');
const cors = require('cors');

const app = express();
const server = http.Server(app);
// const io = require("socket.io")(server);
const io = require('./socket').init(server);

const dev = process.env.NODE_ENV !== 'production';

const nextApp = next({ dev });

const handler = nextApp.getRequestHandler();

require('dotenv').config({ path: './config.env' });

const signupRoute = require('./Backend/routes/signup');
const authRoute = require('./Backend/routes/auth');
const searchRoute = require('./Backend/routes/search');
const postRoute = require('./Backend/routes/post');
const profileRouter = require('./Backend/routes/profile');
const notificationsRouter = require('./Backend/routes/notifications');
const chatRouter = require('./Backend/routes/chat');
const resetRouter = require('./Backend/routes/reset');

const connectDb = require('./utilsServer/connectDb');

connectDb();
app.use(express.json());
const PORT = process.env.PORT || 3000;
const {
  addUser,
  removeUser,
  findConnectedUser,
} = require('./utilsServer/roomActions');
const messagesActions = require('./utilsServer/messageActions');

io.on('connection', (socket) => {
  socket.on('join', async ({ userId }) => {
    const users = await addUser(userId, socket.id);

    setInterval(() => {
      socket.emit('connectedUsers', {
        users: users.filter((user) => user.userId !== userId),
      });
    }, 10000);
  });

  socket.on('loadMessages', async ({ userId, messageWith }) => {
    const { chat, error } = await messagesActions.loadMessages(
      userId,
      messageWith
    );

    if (!error) {
      socket.emit('messageLoaded', { chat });
    }
    //
    else {
      socket.emit('noChatFound');
    }
  });

  socket.on('sendNewMessage', async ({ userId, msgSendToUserId, msg }) => {
    const { newMsg, error } = await messagesActions.sendMsg(
      userId,
      msgSendToUserId,
      msg
    );

    const receiverSocket = findConnectedUser(msgSendToUserId);

    if (receiverSocket) {
      io.to(receiverSocket.socketId).emit('newMsgReceived', { newMsg });
    }
    //
    else {
      await messagesActions.setMsgToUnread(msgSendToUserId);
    }

    if (!error) {
      socket.emit('msgSent', { newMsg });
    }
  });

  socket.on('deleteMessage', async ({ userId, messageWith, messageId }) => {
    const { success } = await messagesActions.deleteMsg(
      userId,
      messageWith,
      messageId
    );

    if (success) {
      socket.emit('msgDeleted');
    }
  });

  socket.on(
    'semdMsgFromNotifications',
    async ({ userId, msgSendToUserId, msg }) => {
      const { newMsg, error } = await messagesActions.sendMsg(
        userId,
        msgSendToUserId,
        msg
      );

      const isOnline = findConnectedUser(msgSendToUserId);

      if (isOnline) {
        io.to(isOnline.socketId).emit('newMsgReceived', { newMsg });
      } else {
        await messagesActions.setMsgToUnread(msgSendToUserId);
      }

      !error && socket.emit('msgSentFromNotification');
    }
  );

  socket.on('disconnect', () => {
    removeUser(socket.id);
  });
});

nextApp.prepare().then(() => {
  app.use(cors());
  app.use('/api/signup', signupRoute);
  app.use('/api/auth', authRoute);
  app.use('/api/search', searchRoute);
  app.use('/api/posts', postRoute);
  app.use('/api/profile', profileRouter);
  app.use('/api/notifications', notificationsRouter);
  app.use('/api/chats', chatRouter);
  app.use('/api/reset', resetRouter);

  app.all('*', (req, res) => handler(req, res));
  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`Express server running on ${PORT}`);
  });
});
