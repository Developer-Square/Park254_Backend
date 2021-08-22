/* eslint-disable security/detect-non-literal-require, import/no-dynamic-require, global-require, no-return-await */
const { Agenda } = require('agenda');
const config = require('../config/config');
// const logger = require('../config/logger');

const agenda = new Agenda({ db: { address: config.mongoose.url } });

const jobTypes = ['updateSpace'];

jobTypes.forEach((type) => {
  require(`./jobsList/${type}`)(agenda);
});

if (jobTypes.length) {
  // agenda.on('ready', async () => await agenda.start());
  agenda.on('ready', async () => {
    // logger.info(`Initializing agenda jobs`);
    await agenda.start();
  });

  // agenda.on('start', (job) => {
  //   logger.debug(`Job ${job.attrs.name} starting`);
  // });
  // agenda.on('complete', (job) => {
  //   logger.debug(`Job ${job.attrs.name} finished`);
  // });
  // agenda.on('success', (job) => {
  //   logger.debug(`Job ${job.attrs.name} success`);
  // });
  // agenda.on('fail', (err, job) => {
  //   logger.debug(`@@@@@@@@@@@@@@@@@@@Job ${job.attrs.name} failed with error: ${err.message}`);
  // });

  // agenda.on('error', (err, job) => {
  //   logger.debug(`@@@@@@@@@@@@@@@@@@@Job ${job.attrs.name} failed with error: ${err.message}`);
  // });
}

agenda.defaultLockLifetime(2000);

const graceful = () => {
  agenda.stop(() => process.exit(0));
};

process.on('SIGTERM', graceful);
process.on('SIGINT', graceful);

module.exports = agenda;
