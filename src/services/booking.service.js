const { Booking } = require('../models');

/**
 * Creates a booking
 * @param {Object} bookingBody
 * @returns {Promise<Booking>}
 */
const createBooking = async (bookingBody) => {
  const booking = await Booking.create(bookingBody);
  return booking;
};

/**
 * Query for bookings
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {number} [options.populate] - Population options (default = parkingLotId, clientId)
 * @returns {Promise<QueryResult>}
 */
const getBookings = async (filter, options) => {
  const bookings = await Booking.paginate(filter, options);
  return bookings;
};

/**
 * Get booking by id
 * @param {String} id
 * @returns {Promise<Booking>}
 */
const getBookingById = async (id) => {
  return Booking.findById(id).populate('parkingLotId');
};

/**
 * Updates booking using id
 * @param {String} bookingId
 * @param {Object} updateBody
 * @returns {Promise<Booking>}
 */
const updateBookingById = async (bookingId, updateBody) => {
  const booking = await getBookingById(bookingId);
  Object.assign(booking, updateBody);
  await booking.save();
  return booking;
};

/**
 * Deletes a booking using id
 * @param {String} bookingId
 * @returns {Promise<Booking>}
 */
const deleteBookingById = async (bookingId) => {
  const booking = await getBookingById(bookingId);
  await booking.remove();
  return booking;
};

/**
 * Cancels a booking
 * @param {String} bookingId
 * @returns {Promise<Booking>}
 */
const cancelBooking = async (bookingId) => {
  const booking = await getBookingById(bookingId);
  Object.assign(booking, { isCancelled: true });
  await booking.save();
  return booking;
};

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingById,
  deleteBookingById,
  cancelBooking,
};
