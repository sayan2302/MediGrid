const mongoose = require('mongoose');

const connectDb = async (mongoUri) => {
  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 20000,
    family: 4,
    retryWrites: true
  });
};

module.exports = { connectDb };
