/* eslint-disable no-console */
const { MongoClient } = require('mongodb');
const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');
require('dotenv').config();

let server;
const client = new MongoClient(config.mongoose.url);

async function main() {
  try {
    await client.connect();
    logger.info('Connected correctly to server');
    server = app.listen(config.port, () => {
      logger.info(`Server listening on port ${config.port}`);
    });
  } catch (error) {
    logger.error(error);
  }
}
// mongoose
//   .connect(config.mongoose.url, config.mongoose.options)
//   .then(() => {
//     logger.info('Connected to MongoDB');
//     server = app.listen(config.port, () => {
//       logger.info(`Listening to port ${config.port}`);
//     });
//   })
//   .catch((err) => console.log(err));

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

main()
  .then(console.log('Server started'))
  .catch(console.error)
  .finally(() => client.close());

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
