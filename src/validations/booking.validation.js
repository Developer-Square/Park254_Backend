const Joi = require('joi');
const { objectId } = require('./custom.validation');

const book = {
  body: Joi.object().keys({
    entryTime: Joi.string().required(),
    exitTime: Joi.string().required(),
    parkingLotId: Joi.string().custom(objectId).required(),
    spaces: Joi.number().required().min(1),
    clientId: Joi.string().custom(objectId).required(),
  }),
};

const getBookingById = {
  params: Joi.object().keys({
    bookingId: Joi.string().custom(objectId),
  }),
};

const queryBookings = {
  query: Joi.object().keys({
    parkingLotId: Joi.string().custom(objectId),
    clientId: Joi.string().custom(objectId),
    isCancelled: Joi.boolean(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    populate: Joi.string(),
  }),
};

const updateBookingById = {
  params: Joi.object().keys({
    bookingId: Joi.string().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      entryTime: Joi.string(),
      exitTime: Joi.string(),
      parkingLotId: Joi.string().custom(objectId),
      spaces: Joi.number().min(1),
    })
    .min(1),
};

const deleteBookingById = {
  params: Joi.object().keys({
    bookingId: Joi.string().custom(objectId),
  }),
};

const cancelBooking = {
  params: Joi.object().keys({
    bookingId: Joi.string().custom(objectId),
  }),
};

const findAvailableSpaces = {
  body: Joi.object().keys({
    entryTime: Joi.string().required(),
    exitTime: Joi.string().required(),
    parkingLots: Joi.array().items(Joi.string().custom(objectId)).required(),
  }),
};
module.exports = {
  book,
  getBookingById,
  queryBookings,
  updateBookingById,
  deleteBookingById,
  cancelBooking,
  findAvailableSpaces,
};
