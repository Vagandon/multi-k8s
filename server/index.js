const keys = require('./keys');

// Express App Setup
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors()); // allows to make requests from one domain (the react app)
                 // to a different domain / port where the express-api
                 // is hosted on
app.use(bodyParser.json()); // parses the requests from the react app
                            // and turns the body of the request into
                            // a json value which the express api can work on

// ----------------------------------------------------
// Postgres Client Setup
const { Pool } = require('pg');
const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort
});
// Log message if the connection is lost (or another error occurs):
pgClient.on('error', () => console.log('Lost PG connection'));

// Initial table creation to store the indicies of submitted values
// (that's the job of our database)
/*
pgClient.on('connect', () => {
    pgClient
      .query('CREATE TABLE IF NOT EXISTS values (number INT)')
      .catch((err) => console.log(err));
  });
*/
/* old: */
pgClient
    .query('CREATE TABLE IF NOT EXISTS values (number INT)')
    .catch(err => console.log(err));
// */

// ----------------------------------------------------
// Redis Client Setup
const redis = require('redis');
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
});

// We need a duplicate for listining, subscribing, etc.
// Otherwise one cannot do anything else with just one instance
const redisPublisher = redisClient.duplicate();

// ----------------------------------------------------
// Express route handlers

// Test routing rule: if someone makes request to "/"-route of application,
// the system responds with 'Hi'
// - note below (req, res) means this consists of a request and a response
app.get('/', (req, res) => {
    res.send('Hi');
});

// Read-request 1: request which queries PostGres for all indices submitted so far
app.get('/values/all', async (req, res) => {
    const values = await pgClient.query('SELECT * from values');

    res.send(values.rows); // we are only interested in the actual data in the table rows
                           // not any metadata contained in values
});

// Read-request 2: a request which gets all indices and values calculated from redis
// Note that we cannot use "await" for redis => not supported for standard nodes
// => a normal callback must be used.
app.get('/values/current', async (req, res) => {
    redisClient.hgetall('values', (err, values) => {
        res.send(values);
    });
});

// Write request: so, now we get a post request and need to initiate the correct calls
// to PostGres and redis
app.post('/values', async (req, res) => {
    const index = req.body.index;

    // prevent indices which are too high because the computation would take forever
    if (parseInt(index) > 40) {
        return res.status(422).send('Index too high');
    }

    // note that the worker is triggered by the change in redis
    redisClient.hset('values', index, 'Nothing yet!');
    redisPublisher.publish('insert', index);
    pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);

    res.send({ working: true });
});

// Set up a listener on port 5000:
app.listen(5000, err => {
    console.log('Listening');
});
