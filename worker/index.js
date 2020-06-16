const keys = require('./keys'); // will contain the hostname and ports to connect to redis
const redis = require('redis'); // require a redis API (?)

// Create a redis client
// Pass the connection information and make every 1000 ms a connection attempt
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
});

// create a duplicate of the redis client, which serves as a subscription
// used to monitor and react on changes
const sub = redisClient.duplicate();

// calculate the fibonnaci value for a given index
// - this is maybe the most straight-forward implementation
// - it is also a very slow solution and thus is an example on
//   why to have a separate worker process
function fib(index){
    if (index < 2) return 1;
    return fib(index - 1) + fib(index - 2);
}

// sub is doing something when a subscribed event happens (see below)
// and a new message is received => then a callback function is executed 
// we perform a hash-set on a hash called "values"
sub.on('message', (channel, message) => {
    redisClient.hset('values', message, fib(parseInt(message)));
});

// To which redis-events do we subscribe:
sub.subscribe('insert');
