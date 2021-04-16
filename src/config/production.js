require('dotenv').config();

module.exports = {
  JWT_SECRET: process.env.PRODUCTION_JWT_SECRET,
  SMTP_PASSWORD: process.env.PRODUCTION_SMTP_PASSWORD,
  MONGODB_ATLAS_URL: `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@parking-app-server.sgvnp.mongodb.net/Parking?retryWrites=true&w=majority`,
};
