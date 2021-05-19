const Mpesa = require('./mPesa');
const config = require('../config/config');

const mPesa = new Mpesa({
  consumerKey: config.mpesa.consumer_key,
  consumerSecret: config.mpesa.consumer_secret,
  environment: 'sandbox',
  shortCode: 174379,
  lipaNaMpesaShortCode: 174379,
  lipaNaMpesaShortPass: 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919',
});

module.exports = mPesa;
