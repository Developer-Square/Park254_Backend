const path = require('path');
const Mpesa = require('./mPesa');
const config = require('../config/config');

const mPesa = new Mpesa({
  consumerKey: config.mpesa.consumer_key,
  consumerSecret: config.mpesa.consumer_secret,
  environment: 'production',
  shortCode: 888884,
  lipaNaMpesaShortCode: 888884,
  lipaNaMpesaShortPass: config.mpesa.passkey,
  certPath: path.resolve('./keys/ProductionCertificate.cer'),
});

module.exports = mPesa;
