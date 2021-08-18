const Joi = require('joi');
const { objectId } = require('./custom.validation');

const validLocation = Joi.object().keys({
  type: Joi.string().valid('Point').required(),
  coordinates: Joi.array().ordered(Joi.number().min(-180).max(180).required(), Joi.number().min(-90).max(90).required()),
});

const validFeatures = Joi.object().keys({
  accessibleParking: Joi.boolean().valid(true, false),
  cctv: Joi.boolean().valid(true, false),
  evCharging: Joi.boolean().valid(true, false),
  carWash: Joi.boolean().valid(true, false),
  valetParking: Joi.boolean().valid(true, false),
});

const createParkingLot = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    spaces: Joi.number().required().min(1),
    location: validLocation.required(),
    images: Joi.array().required(),
    owner: Joi.string().custom(objectId).required(),
    price: Joi.number().required().min(1),
    city: Joi.string(),
    address: Joi.string().required(),
    features: validFeatures,
  }),
};

const getParkingLotById = {
  params: Joi.object().keys({
    parkingLotId: Joi.string().custom(objectId),
  }),
};

const queryParkingLots = {
  query: Joi.object().keys({
    name: Joi.string(),
    owner: Joi.string().custom(objectId),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    populate: Joi.string().valid('owner'),
  }),
};

const updateParkingLotById = {
  params: Joi.object().keys({
    parkingLotId: Joi.string().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      owner: Joi.string().custom(objectId),
      spaces: Joi.number().min(1),
      location: validLocation,
      images: Joi.array(),
      price: Joi.number().min(1),
      city: Joi.string(),
      address: Joi.string(),
      features: validFeatures,
    })
    .min(1),
};

const deleteParkingLotById = {
  params: Joi.object().keys({
    parkingLotId: Joi.string().custom(objectId),
  }),
};

const findNearestParkingLot = {
  query: Joi.object().keys({
    longitude: Joi.number().required(),
    latitude: Joi.number().required(),
    maxDistance: Joi.number(),
  }),
};

const bookParkingLot = {
  params: Joi.object().keys({
    parkingLotId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    time: Joi.number().required().min(1),
    spaces: Joi.number().required().min(1),
  }),
};

module.exports = {
  createParkingLot,
  getParkingLotById,
  queryParkingLots,
  updateParkingLotById,
  deleteParkingLotById,
  findNearestParkingLot,
  bookParkingLot,
};
