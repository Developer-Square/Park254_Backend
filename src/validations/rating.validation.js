const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createRating = {
  body: Joi.object().keys({
    userId: Joi.string().custom(objectId).required(),
    parkingLotId: Joi.string().custom(objectId).required(),
    value: Joi.number().min(1).max(5).required(),
  }),
};

const getRatingById = {
  params: Joi.object().keys({
    ratingId: Joi.string().custom(objectId),
  }),
};

const queryRatings = {
  query: Joi.object().keys({
    userId: Joi.string().custom(objectId),
    parkingLotId: Joi.string().custom(objectId),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getRatingCounts = {
  query: Joi.object().keys({
    parkingLotId: Joi.string().custom(objectId),
  }),
};

const deleteRatingById = {
  params: Joi.object().keys({
    ratingId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createRating,
  getRatingById,
  queryRatings,
  deleteRatingById,
  getRatingCounts,
};
