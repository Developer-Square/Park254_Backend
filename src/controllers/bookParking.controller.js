const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { bookingService, bookParkingService, parkingLotService, userService } = require('../services');
const verifyUser = require('../utils/verifyUser');

const book = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.body.clientId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await verifyUser(req.user, req.body.clientId);
  const booking = await bookParkingService.book(
    req.body.entryTime,
    req.body.exitTime,
    req.body.parkingLotId,
    req.body.spaces,
    req.body.clientId
  );
  res.status(httpStatus.CREATED).send(booking);
});

const updateBookedParkingLot = catchAsync(async (req, res) => {
  const booking = await bookingService.getBookingById(req.params.bookingId);
  if (!booking) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Booking not found');
  }
  await verifyUser(req.user, booking.clientId.id);
  const updatedBooking = await bookParkingService.updateBookedParkingLot(
    req.body.entryTime,
    req.body.exitTime,
    req.body.parkingLotId,
    req.body.spaces,
    req.params.bookingId
  );
  res.status(httpStatus.OK).send(updatedBooking);
});

const cancelBooking = catchAsync(async (req, res) => {
  const booking = await bookingService.getBookingById(req.params.bookingId);
  if (!booking) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Booking not found');
  }
  await verifyUser(req.user, booking.clientId.id);
  const cancelledBooking = await bookParkingService.cancelBooking(req.params.bookingId);
  res.status(httpStatus.OK).send(cancelledBooking);
});

const findAvailableSpaces = catchAsync(async (req, res) => {
  const result = await parkingLotService.findAvailableSpaces(req.body.parkingLots, req.body.entryTime, req.body.exitTime);
  if (result.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No booked parking lots found');
  }
  res.status(httpStatus.OK).send({ results: result });
});

module.exports = {
  book,
  updateBookedParkingLot,
  cancelBooking,
  findAvailableSpaces,
};
