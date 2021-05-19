/* eslint-disable prefer-rest-params */
const lipaNaMpesaOnline = require('./lipaNaMpesaOnline');
const lipaNaMpesaQuery = require('./LipaNaMpesaQuery');
const oAuth = require('./oAuth');
const request = require('./request');
const security = require('./security');

/**
 * Class representing the Mpesa instance
 */
class Mpesa {
  /**
   * Introduce Mpesa Configuration
   * @constructor
   * @param {Object} [config={}] The Configuration  to use for mPesa
   */
  constructor(config = {}) {
    if (!config.consumerKey) throw new Error('Consumer Key is Missing');
    if (!config.consumerSecret) throw new Error('Consumer Secret is Missing');
    this.configs = { ...config };
    this.enviroment = config.environment === 'production' ? 'production' : 'sandbox';
    this.request = request.bind(this);
    this.security = () => {
      return security(this.configs.certPath, this.configs.securityCredential);
    };
    this.baseURL = `https://${this.enviroment === 'production' ? 'api' : 'sandbox'}.safaricom.co.ke`;
  }

  lipaNaMpesaOnline() {
    return lipaNaMpesaOnline.bind(this)(...arguments);
  }

  lipaNaMpesaQuery() {
    return lipaNaMpesaQuery.bind(this)(...arguments);
  }

  oAuth() {
    const { consumerKey, consumerSecret } = this.configs;
    return oAuth.bind(this)(consumerKey, consumerSecret);
  }
}

module.exports = Mpesa;
