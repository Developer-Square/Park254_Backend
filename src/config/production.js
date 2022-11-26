require('dotenv').config();

module.exports = {
  JWT_SECRET: process.env.PRODUCTION_JWT_SECRET,
  SMTP_PASSWORD: process.env.PRODUCTION_SMTP_PASSWORD,
  SMTP_USERNAME: process.env.PRODUCTION_SMTP_USERNAME,
  MONGODB_ATLAS_URL: `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@park254cluster.9bgopsv.mongodb.net/main?retryWrites=true&w=majority`,
  MPESA_CONSUMER_KEY: process.env.MPESA_CONSUMER_KEY,
  MPESA_CONSUMER_SECRET: process.env.MPESA_CONSUMER_SECRET,
  MPESA_PASSKEY: process.env.MPESA_PASSKEY,
};
