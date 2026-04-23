const app = require('./app');
const env = require('./config/env');
const { connectDb } = require('./config/db');
const { initFirebase } = require('./config/firebase');
const { initCronJobs } = require('./scripts/cronJobs');

const RETRY_MS = 8000;

const wait = (ms) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

const connectDbWithRetry = async () => {
  while (true) {
    try {
      await connectDb(env.mongoUri);
      console.log('MongoDB connected');
      initCronJobs(); // Initialize cron jobs after DB connection
      return;
    } catch (error) {
      console.error('MongoDB connection failed. Retrying soon.');
      console.error('Likely causes: Atlas IP access list, credentials, or network restrictions.');
      console.error(error.message);
      await wait(RETRY_MS);
    }
  }
};

const start = async () => {
  try {
    initFirebase();
    app.listen(env.port, () => {
      console.log(`MediGrid backend listening on port ${env.port}`);
    });

    // Keep API available even when Atlas is temporarily unreachable.
    connectDbWithRetry().catch((error) => {
      console.error('Background MongoDB retry loop stopped unexpectedly.');
      console.error(error.message);
    });
  } catch (error) {
    console.error('Failed to start backend', error);
  }
};

start();
