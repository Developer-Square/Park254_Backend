const Mpesa = require('./mPesa');
const production = require('../config/production');

const mPesa = new Mpesa({
  consumerKey: production.MPESA_CONSUMER_KEY,
  consumerSecret: production.MPESA_CONSUMER_SECRET,
  environment: 'sandbox',
  shortCode: 174379,
  lipaNaMpesaShortCode: 174379,
  lipaNaMpesaShortPass: 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919',
});

module.exports = mPesa;
