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

const joinRoomRedis = ({ userId, roomId }) => client.sadd(`room:${roomId}`, userId);

const getUserRedis = (id) => client.get(`user:${id}`, (err, value) => {
  if (err) return err;
  return value;
});

const getSocketRedis = (userId) => {
  client.get(`user:id:${userId}`, (value) => value);
};

module.exports = {
  addUserRedis,
  removeUserRedis,
  joinRoomRedis,
  getUserRedis,
  getSocketRedis,
  client
};
