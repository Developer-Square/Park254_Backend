const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createParkingLot = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    spaces: Joi.number().required().min(1),
    location: Joi.object().required(),
    images: Joi.array().required(),
    owner: Joi.string().custom(objectId).required(),
    price: Joi.number().required().min(1),
    city: Joi.string(),
    address: Joi.string().required(),
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
      location: Joi.object(),
      images: Joi.array(),
      price: Joi.number().min(1),
      city: Joi.string(),
      address: Joi.string(),
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
