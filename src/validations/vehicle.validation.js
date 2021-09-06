const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createVehicle = {
  body: Joi.object().keys({
    plate: Joi.string().required(),
    model: Joi.string().required(),
    owner: Joi.string().required().custom(objectId),
  }),
};

const getVehicles = {
  query: Joi.object().keys({
    plate: Joi.string(),
    owner: Joi.string().custom(objectId),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getVehicle = {
  params: Joi.object().keys({
    vehicleId: Joi.string().custom(objectId).required(),
  }),
};

const updateVehicle = {
  params: Joi.object().keys({
    vehicleId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      plate: Joi.string(),
      model: Joi.string(),
      owner: Joi.string().custom(objectId),
    })
    .min(1),
};

const deleteVehicle = {
  params: Joi.object().keys({
    vehicleId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  createVehicle,
  getVehicles,
  getVehicle,
  updateVehicle,
  deleteVehicle,
};
