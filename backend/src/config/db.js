const mongoose = require('mongoose');

const connectDb = async (mongoUri) => {
  await mongoose.connect(mongoUri);
};

module.exports = { connectDb };
