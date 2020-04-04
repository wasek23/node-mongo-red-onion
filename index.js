const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const uri = process.env.DB_PATH;
let client = new MongoClient(uri, { useNewUrlParser: true });

// Get
app.get('/', (req, res) => {
    res.send('<a href="/foods">Foods</a>');
});
app.get('/foods', (req, res) => {
    client = new MongoClient(uri, { useNewUrlParser: true });
    client.connect(err => {
        const collection = client.db("onlineStore").collection("foods");
        collection.find().toArray((err, documents) => {
            if (err) {
                console.log(err);
                res.status(500).send({ message: err });
            } else {
                res.send(documents);
            }
        });
        client.close();
    });
});

app.get('/food/:key', (req, res) => {
    const key = req.params.key;

    client = new MongoClient(uri, { useNewUrlParser: true });
    client.connect(err => {
        const collection = client.db("onlineStore").collection("foods");
        collection.find({ key }).toArray((err, documents) => {
            if (err) {
                console.log(err);
                res.status(500).send({ message: err });
            } else {
                res.send(documents[0]);
            }
        });
        client.close();
    });
});

// Post
app.post('/getFoodsByKey', (req, res) => {
    const key = req.params.key;
    const foodKeys = req.body;

    client = new MongoClient(uri, { useNewUrlParser: true });
    client.connect(err => {
        const collection = client.db("onlineStore").collection("foods");
        collection.find({ key: { $in: foodKeys } }).toArray((err, documents) => {
            if (err) {
                console.log(err);
                res.status(500).send({ message: err });
            } else {
                res.send(documents);
            }
        });
        client.close();
    });
});

app.post('/addFood', (req, res) => {
    const food = req.body;

    client = new MongoClient(uri, { useNewUrlParser: true });
    client.connect(err => {
        const collection = client.db("onlineStore").collection("foods");
        collection.insert(food, (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).send({ message: err });
            } else {
                res.send(result.ops[0]);
            }
        });
        client.close();
    });
});

app.post('/placeOrder', (req, res) => {
    const orderDetails = req.body;
    orderDetails.orderTime = new Date();

    client = new MongoClient(uri, { useNewUrlParser: true });
    client.connect(err => {
        const collection = client.db("onlineStore").collection("orders");
        collection.insertOne(orderDetails, (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).send({ message: err });
            } else {
                res.send(result.ops[0]);
            }
        });
        client.close();
    });
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening to port ${port}`));