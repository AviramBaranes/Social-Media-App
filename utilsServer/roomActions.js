const users = [];

const addUser = async (userId, socketId) => {
  const user = users.find((user) => user.userId === userId);

  if (user && user.socketId === socketId) {
    return users;
  } else {
    if (user && user.socketId !== socketId) {
      await removeUser(user.socketId);
    }

    const newUser = { userId, socketId };

    users.push(newUser);

    return users;
  }
};

const removeUser = async (socketId) => {
  const userIndex = users.findIndex((user) => user.socketId === socketId);
  await users.splice(userIndex, 1);

  return;
};

const findConnectedUser = (userId) =>
  users.find((user) => user.userId === userId);

module.exports = { addUser, removeUser, findConnectedUser };
