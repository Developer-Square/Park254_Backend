// eslint-disable-next-line no-unused-vars
const { Booking } = require('../models');
const agenda = require('../jobs/agenda');
const { bookingService } = require('.');

/**
 * Confirms whether parking lot space is available and returns number of spaces
 * @param {String} parkingLotId
 * @param {String} entryTime
 * @param {String} exitTime
 * @param {Number} spaces
 * @returns {Promise<{ availableSpaces: Number; available: boolean; }>}
 */
const confirmParkingSpaces = async (parkingLotId, entryTime, exitTime, spaces, totalSpaces) => {
  const pipeline = [
    {
      $match: {
        $and: [{ parkingLotId }, { entryTime: { $gte: new Date(entryTime) } }, { exitTime: { $lte: new Date(exitTime) } }],
      },
    },
    {
      $group: {
        _id: null,
        bookedSpaces: { $sum: '$spaces' },
      },
    },
    {
      $addFields: {
        remainingSpaces: { $subtract: [totalSpaces, '$bookedSpaces'] },
      },
    },
    { $project: { remainingSpaces: 1, _id: 0 } },
  ];

  const result = Booking.aggregate(pipeline);
  // eslint-disable-next-line no-console
  console.log(result);
  const availableSpaces = result[0].remainingSpaces;
  const available = spaces - availableSpaces > 0;
  return { availableSpaces, available };
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
  const bookingBody = {
    entryTime,
    exitTime,
    parkingLotId,
    clientId,
    spaces,
  };
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
