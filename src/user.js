const users = [];

const addUser = ({ id, userId }) => {
  const existingUser = users.find((user) => user.userId === userId);
  if (existingUser) return { error: 'User is logged in!' };
  const user = {
    id,
    userId,
    rooms: [],
  };
  users.push(user);
  return user;
};

const joinRoom = ({ userId, roomId }) => {
  const user = users.find((userS) => userS.userId === userId);
  user.rooms.push(roomId);
  return user;
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
  return null;
};

const getUser = (id) => users.find((user) => user.id === id);

const getSocket = (userId) => users.find((user) => user.userId === userId);

const getUserInRoom = (room) => {
  users.filter((user) => user.rooms.indexOf(room) !== -1);
};
module.exports = {
  addUser,
  removeUser,
  joinRoom,
  getSocket,
  getUser,
  getUserInRoom,
};
