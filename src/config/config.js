const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');
const production = require('./production');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(3000),
    MONGODB_URL: Joi.string().required().description('Mongo DB url'),
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(30).description('minutes after which access tokens expire'),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(30).description('days after which refresh tokens expire'),
    SMTP_HOST: Joi.string().description('server that will send the emails'),
    SMTP_PORT: Joi.number().description('port to connect to the email server'),
    SMTP_USERNAME: Joi.string().description('username for email server'),
    SMTP_PASSWORD: Joi.string().description('password for email server'),
    EMAIL_FROM: Joi.string().description('the from field in the emails sent by the app'),
    CONSUMER_KEY: Joi.string().required().description('Mpesa consumer key'),
    CONSUMER_SECRET: Joi.string().required().description('Mpesa consumer secret'),
    MPESA_PASSKEY_SANDBOX: Joi.string().required().description('Mpesa passkey'),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongoose: {
    url:
      envVars.NODE_ENV === 'production'
        ? production.MONGODB_ATLAS_URL
        : envVars.MONGODB_URL + (envVars.NODE_ENV === 'test' ? '-test' : ''),
    options: {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  jwt: {
    secret: envVars.NODE_ENV === 'production' ? production.JWT_SECRET : envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes: 10,
  },
  email: {
    smtp: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      auth: {
        user: envVars.NODE_ENV === 'production' ? production.SMTP_USERNAME : envVars.SMTP_USERNAME,
        pass: envVars.NODE_ENV === 'production' ? production.SMTP_PASSWORD : envVars.SMTP_PASSWORD,
      },
    },
    from: envVars.EMAIL_FROM,
  },
  mpesa: {
    consumer_key: envVars.NODE_ENV === 'production' ? production.MPESA_CONSUMER_KEY : envVars.CONSUMER_KEY,
    consumer_secret: envVars.NODE_ENV === 'production' ? production.MPESA_CONSUMER_SECRET : envVars.CONSUMER_SECRET,
    passkey: envVars.NODE_ENV === 'production' ? production.MPESA_PASSKEY : envVars.CONSUMER_SECRET,
  },
};
