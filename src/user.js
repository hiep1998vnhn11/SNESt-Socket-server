const client = require('./redis');

const addUser = async ({ id, userId }) => {
  try {
    await client.set(`user:${id}`, userId);
    await client.set(`user:id:${userId}`, id);
    return null;
  } catch (err) {
    return err;
  }
};
const removeUser = async (id) => {
  try {
    const userId = await client.get(`user:${id}`);
    await client.del(`user:${id}`);
    await client.del(`user:id:${userId}`);
    return userId;
  } catch (err) {
    return err;
  }
};

const getUser = async (id) => {
  try {
    const userId = await client.get(`user:${id}`);
    return userId;
  } catch (err) {
    console.log(err);
    return null;
  }
};

const getSocket = async (userId) => {
  try {
    const socketId = await client.get(`user:id:${userId}`);
    return socketId;
  } catch (err) {
    console.log(err);
    return null;
  }
};

// const joinRoomRedis = ({ userId, roomId }) =>
//   client.sadd(`room:${roomId}`, userId);

// const getUserRedis = (id) =>
//   client.get(`user:${id}`, (err, value) => {
//     if (err) return err;
//     return value;
//   });

// const getSocketRedis = (userId) => {
//   client.get(`user:id:${userId}`, (value) => value);
// };

module.exports = {
  addUser,
  removeUser,
  getUser,
  getSocket,
};
