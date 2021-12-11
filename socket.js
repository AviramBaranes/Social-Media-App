let io;

module.exports = {
  init: (server) => {
    io = require("socket.io")(server);
    return io;
  },
  getIo: () => {
    if (!io) {
      console.log("Failed to connect socket io");
    }
    return io;
  },
};
