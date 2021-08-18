const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { bookingService, parkingLotService, userService, bookParkingService } = require('../services');

const book = catchAsync(async (req, res) => {
  const parkingLot = await parkingLotService.getParkingLotById(req.body.parkingLotId);
  if (!parkingLot) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Parking lot not found');
  }
  const user = await userService.getUserById(req.body.clientId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  /// TODO: Add confirmation of parking spaces
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
  const parkingLot = await parkingLotService.getParkingLotById(req.body.parkingLotId);
  if (!parkingLot) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Parking lot not found');
  }
  const booking = await bookingService.getBookingById(req.params.bookingId);
  if (!booking) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Booking not found');
  }
  /// TODO: Add confirmation of parking spaces
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
  const booking = await bookParkingService.cancelBooking(req.params.bookingId);
  res.status(httpStatus.OK).send(booking);
});

module.exports = {
  book,
  updateBookedParkingLot,
  cancelBooking,
};
