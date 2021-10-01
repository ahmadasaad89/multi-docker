const keys = require("./keys");


// Express App Setup
const cors = require('cors');
const bodyParser = require('body-parser')
const express = require('express');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Postgres Client Setup

const { Pool } = require('pg');

const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort
});

pgClient.on('error', () => console.log('Lost PG connection'));

pgClient
    .connect()
    .then(client => {
        return client
            .query('CREATE TABLE IF NOT EXISTS values (number INT)')
            .then(res => {
                client.release();
                console.log('1', res.rows[0]);
            })
            .catch(err => {
                client.release();
                console.log('2', err.stack);
            });
    }).catch((err) => console.log('error1', err));

// Redis client setup
const redis = require('redis');
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000,
});

const redisPublisher = redisClient.duplicate();

// Express route handlers
app.get("/", (req, res) => {
    res.send("Hi");
});

app.get("/values/all", async (req, res) => {
    const values = await pgClient.query("SELECT * from values");

    res.send(values.rows);
});

app.get("/values/current", async (req, res) => {
    redisClient.hgetall("values", (err, values) => {
        res.send(values);
    });
});

app.post("/values", async (req, res) => {
    const index = req.body.index;

    if (parseInt(index) > 40) {
        return res.status(422).send("Index too high");
    }

    redisClient.hset("values", index, "Nothing yet1!");
    redisPublisher.publish("insert", index);
    pgClient.query("INSERT INTO values(number) VALUES($1)", [index]);

    res.send({ working: true });
});


app.listen(5000, (err) => {
    console.log('Listening on port 5000!');
});