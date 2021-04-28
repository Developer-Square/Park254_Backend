/* eslint-disable security/detect-non-literal-require, import/no-dynamic-require, global-require, no-return-await */
const { Agenda } = require('agenda');
const config = require('../config/config');

const agenda = new Agenda({ db: { address: config.mongoose.url } });

const jobTypes = ['updateSpace'];

jobTypes.forEach((type) => {
  require(`./jobsList/${type}`)(agenda);
});

if (jobTypes.length) {
  agenda.on('ready', async () => await agenda.start());
}

const graceful = () => {
  agenda.stop(() => process.exit(0));
};

process.on('SIGTERM', graceful);
process.on('SIGINT', graceful);

module.exports = agenda;
