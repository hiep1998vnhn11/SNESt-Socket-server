const redis = require('promise-redis')();

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

module.exports = client;
