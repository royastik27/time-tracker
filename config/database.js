const { MongoClient } = require('mongodb');

// const mongoose = require('mongoose');
const mongoClient = new MongoClient(process.env.MONGODB_URL);

exports.mongoClient = mongoClient;