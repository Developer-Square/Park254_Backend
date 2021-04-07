require('dotenv').config();

module.exports = {
  MONGODB_ATLAS_URL: process.env.MONGODB_ATLAS_URL,
  JWT_SECRET: process.env.PRODUCTION_JWT_SECRET,
  SMTP_PASSWORD: process.env.PRODUCTION_SMTP_PASSWORD,
};
