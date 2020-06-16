// Need to make sure that the required environment variables are set when this is used
module.exports = {
    redisHost: process.env.REDIS_HOST,
    redisPort: process.env.REDIS_PORT
};