const { createClient } = require('redis');
let redisClient;

const connectRedis = async () => {
  redisClient = createClient({
    socket: {
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379
    }
  });

  redisClient.on('error', err => console.error('Redis Client Error', err));
  await redisClient.connect();
  console.log('Redis connected');
};

const getRedisClient = () => redisClient;

module.exports = { connectRedis, getRedisClient };
