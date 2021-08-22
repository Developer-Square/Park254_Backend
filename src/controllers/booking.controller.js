const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { bookingService } = require('../services');

const getBookings = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['parkingLotId', 'clientId', 'isCancelled']);
  const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);
  const result = await bookingService.getBookings(filter, options);
  res.send(result);
});

const getBookingById = catchAsync(async (req, res) => {
  const booking = await bookingService.getBookingById(req.params.bookingId);
  if (!booking) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Booking not found');
  }
  res.send(booking);
});

const deleteBookingById = catchAsync(async (req, res) => {
  await bookingService.deleteBookingById(req.params.bookingId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  getBookings,
  getBookingById,
  deleteBookingById,
};
