const redis = require('redis');

const options = process.env.REDIS_PASSWORD
  ? {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
  }
  : {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  };
const client = redis.createClient(options);

const addUserRedis = async ({ id, userId }) => {
  await client.set(`user:${id}`, userId);
  await client.set(`user:id:${userId}`, id);
  return null;
};

const removeUserRedis = (id) => client.get(`user:${id}`, async (err, value) => {
  if (err) return err;
  await client.del(`user:${id}`);
  await client.del(`user:id:${value}`);
  return true;
});

const joinRoomRedis = ({ userId, roomId }) => client.sadd(`user:${userId}:room`, roomId);

const getUserRedis = (id) => client.get(`user:${id}`, (err, value) => {
  if (err) return err;
  return value;
});

const getSocketRedis = (userId) => {
  client.get(`user:id:${userId}`, (value) => value);
};

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
  addUserRedis,
  getUserInRoom,
  removeUserRedis,
  joinRoomRedis,
  getUserRedis,
  getSocketRedis
};
