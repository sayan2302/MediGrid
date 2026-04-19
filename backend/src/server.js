const app = require('./app');
const env = require('./config/env');
const { connectDb } = require('./config/db');
const { initFirebase } = require('./config/firebase');

const start = async () => {
  try {
    await connectDb(env.mongoUri);
    initFirebase();
    app.listen(env.port, () => {
      console.log(`MediGrid backend listening on port ${env.port}`);
    });
  } catch (error) {
    console.error('Failed to start backend', error);
    process.exit(1);
  }
};

start();
