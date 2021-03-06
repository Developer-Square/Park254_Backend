const httpStatus = require('http-status');
const mongoose = require('mongoose');
const { Booking } = require('../models');
const agenda = require('../jobs/agenda');
const { bookingService, parkingLotService } = require('.');
const ApiError = require('../utils/ApiError');

/**
 * Confirms whether parking lot space is available and returns number of spaces
 * @param {String} parkingLotId
 * @param {String} entryTime
 * @param {String} exitTime
 * @param {Number} spaces
 * @returns {Promise<Array<{ occupiedSpaces: Number, availableSpaces: Number, available: Boolean }>>}
 */
const confirmParkingSpaces = async (parkingLotId, entryTime, exitTime, spaces, totalSpaces) => {
  const pipeline = [
    {
      $match: {
        parkingLotId: new mongoose.Types.ObjectId(parkingLotId),
        entryTime: { $lte: new Date(exitTime) },
        exitTime: { $gt: new Date(entryTime) },
      },
    },
    {
      $group: {
        _id: null,
        occupiedSpaces: { $sum: '$spaces' },
      },
    },
    {
      $addFields: {
        availableSpaces: { $subtract: [totalSpaces, '$occupiedSpaces'] },
      },
    },
    {
      $project: {
        _id: 0,
        occupiedSpaces: 1,
        availableSpaces: 1,
        available: { $gt: ['$availableSpaces', spaces] },
      },
    },
  ];

  const result = await Booking.aggregate(pipeline);
  return result;
};

/**
 * Books a parking lot
 * @param {String} entryTime
 * @param {String} exitTime
 * @param {String} parkingLotId
 * @param {Number} spaces
 * @returns {Promise<void>}
 */
const bookParkingLot = async (entryTime, exitTime, spaces, parkingLotId, bookingId) => {
  await agenda.schedule(new Date(entryTime), 'Update parking lot spaces', {
    parkingLotId,
    spaces,
    add: false,
    bookingId,
  });
  await agenda.schedule(new Date(exitTime), 'Update parking lot spaces', {
    parkingLotId,
    spaces,
    add: true,
    bookingId,
  });
};

/**
 * Books a parking lot and creates booking
 * @param {Date} entryTime
 * @param {Date} exitTime
 * @param {String} parkingLotId
 * @param {Number} spaces
 * @param {String} clientId
 * @returns {Promise<Booking>}
 */
const book = async (entryTime, exitTime, parkingLotId, spaces, clientId) => {
  if (new Date(exitTime) <= new Date(entryTime)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Leaving date must be greater than arrival date');
  }
  const bookingBody = {
    entryTime,
    exitTime,
    parkingLotId,
    clientId,
    spaces,
  };
  const parkingLot = await parkingLotService.getParkingLotById(parkingLotId);
  if (!parkingLot) {
    throw new ApiError(httpStatus.NOT_FOUND, 'parking lot not found');
  }
  if (spaces > parkingLot.spaces) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Sorry, parking spaces are not enough. We only have ${parkingLot.spaces} spaces`
    );
  }
  const parkingSpaceInfo = await confirmParkingSpaces(parkingLotId, entryTime, exitTime, spaces, parkingLot.spaces);
  if (parkingSpaceInfo.length > 0) {
    const { available, availableSpaces } = parkingSpaceInfo[0];
    if (!available) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Sorry, parking spaces are not enough. We only have ${availableSpaces} spaces`
      );
    }
  }
  const booking = await bookingService.createBooking(bookingBody);
  await bookParkingLot(entryTime, exitTime, spaces, parkingLotId, booking.id);
  return booking;
};

/**
 * Updates booking and parking lot
 * @param {Date} entryTime
 * @param {Date} exitTime
 * @param {String} parkingLotId
 * @param {Number} spaces
 * @param {String} bookingId
 * @returns {Promise<Booking>}
 */
const updateBookedParkingLot = async (entryTime, exitTime, parkingLotId, spaces, bookingId) => {
  if (new Date(exitTime) <= new Date(entryTime)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Leaving date must be greater than arrival date');
  }
  const parkingLot = await parkingLotService.getParkingLotById(parkingLotId);
  if (!parkingLot) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Parking lot not found');
  }
  if (spaces > parkingLot.spaces) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Sorry, parking spaces are not enough. We only have ${parkingLot.spaces} spaces`
    );
  }
  const parkingSpaceInfo = await confirmParkingSpaces(parkingLotId, entryTime, exitTime, spaces, parkingLot.spaces);
  if (parkingSpaceInfo.length > 0) {
    const { available, availableSpaces } = parkingSpaceInfo[0];
    if (!available) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Sorry, parking spaces are not enough. We only have ${availableSpaces} spaces`
      );
    }
  }
  await agenda.cancel({ 'data.bookingId': bookingId });
  await bookParkingLot(entryTime, exitTime, spaces, parkingLotId, bookingId);
  const updatedBooking = await bookingService.updateBookingById(bookingId, {
    parkingLotId,
    entryTime,
    exitTime,
    spaces,
  });
  return updatedBooking;
};

/**
 * Cancels booking and related agenda using booking id
 * @param {String} bookingId
 * @returns {Promise<Booking>}
 */
const cancelBooking = async (bookingId) => {
  const booking = await bookingService.cancelBooking(bookingId);
  await agenda.cancel({ 'data.bookingId': bookingId });
  return booking;
};

module.exports = {
  bookParkingLot,
  book,
  updateBookedParkingLot,
  confirmParkingSpaces,
  cancelBooking,
};
