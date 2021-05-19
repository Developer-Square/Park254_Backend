const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const docsRoute = require('./docs.route');
const parkingLotRoute = require('./parkingLot.route');
const nearbyParkingRoute = require('./nearbyParking.route');
const ratingRoute = require('./rating.route');
const transactionRoute = require('./transaction.route');
const mpesaRoute = require('./mPesa.route');
const config = require('../../config/config');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/parkingLots',
    route: parkingLotRoute,
  },
  {
    path: '/nearbyParking',
    route: nearbyParkingRoute,
  },
  {
    path: '/ratings',
    route: ratingRoute,
  },
  {
    path: '/mpesa',
    route: transactionRoute,
  },
  {
    path: '/mpesaWebHook',
    route: mpesaRoute,
  },
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
