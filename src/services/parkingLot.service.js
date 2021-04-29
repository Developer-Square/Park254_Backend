const httpStatus = require('http-status');
const { ParkingLot } = require('../models');
const ApiError = require('../utils/ApiError');
const agenda = require('../jobs/agenda');

/**
 * Create a parking lot
 * @param {Object} parkingLotBody
 * @returns {Promise<ParkingLot>}
 */
const createParkingLot = async (parkingLotBody) => {
  const parkingLot = await ParkingLot.create(parkingLotBody);
  return parkingLot;
};

/**
 * Query for parking Lots
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryParkingLots = async (filter, options) => {
  const parkingLots = await ParkingLot.paginate(filter, options);
  return parkingLots;
};

/**
 * Get parkingLot by id
 * @param {ObjectId} id
 * @returns {Promise<ParkingLot>}
 */
const getParkingLotById = async (id) => {
  return ParkingLot.findById(id);
};

/**
 * Update parking lot by id
 * @param {ObjectId} parkingLotId
 * @param {Object} updateBody
 * @returns {Promise<ParkingLot>}
 */
const updateParkingLotById = async (parkingLotId, updateBody) => {
  const parkingLot = await getParkingLotById(parkingLotId);
  if (!parkingLot) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Parking lot not found');
  }
  Object.assign(parkingLot, updateBody);
  await parkingLot.save();
  return parkingLot;
};

/**
 * Delete parking lot by id
 * @param {ObjectId} parkingLotId
 * @returns {Promise<ParkingLot>}
 */
const deleteParkingLotById = async (parkingLotId) => {
  const parkingLot = await getParkingLotById(parkingLotId);
  if (!parkingLot) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Parking lot not found');
  }
  await parkingLot.remove();
  return parkingLot;
};

/**
 * Find nearby parking lots
 * @param {Number} longitude
 * @param {Number} latitude
 * @param {Number} maxDistance (default = 5)
 * @returns {Promise<ParkingLot>} An array of documents nearest to the given location
 */
const findNearestParkingLot = async (longitude, latitude, maxDistance) => {
  const pipeline = [
    {
      $geoNear: {
        distanceField: 'address.distance',
        near: [parseFloat(longitude), parseFloat(latitude)],
        distanceMultiplier: 6371,
        spherical: true,
        key: 'location',
        maxDistance: parseInt(maxDistance, 10) > 0 ? parseInt(maxDistance, 10) / 6371 : 5 / 6371,
      },
    },
  ];

  const nearbyParking = await ParkingLot.aggregate(pipeline);
  return nearbyParking;
};

/**
 * Book parking spaces
 * @param {Number} time - The total parking duration
 * @param {ObjectId} parkingLotId - The id of the parking lot
 * @param {Number} spaces - Total parking spaces
 * @returns {Promise<ParkingLot>}
 */
const book = async (time, parkingLotId, spaces) => {
  const now = new Date();
  const future = now.setMinutes(now.getMinutes + time);
  const parkingLot = await getParkingLotById(parkingLotId);
  if (!parkingLot) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Parking lot not found');
  }
  if (parkingLot.spaces < spaces) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Parking spaces are not enough');
  }
  Object.assign(parkingLot, { spaces: parkingLot.spaces - spaces });
  await parkingLot.save();
  agenda.schedule(future, 'Update parking lot spaces', {
    parkingLotId,
    spaces,
  });
  return parkingLot;
};

module.exports = {
  createParkingLot,
  getParkingLotById,
  queryParkingLots,
  updateParkingLotById,
  deleteParkingLotById,
  findNearestParkingLot,
  book,
};
