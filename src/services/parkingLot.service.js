const httpStatus = require('http-status');
// eslint-disable-next-line no-unused-vars
const { ParkingLot } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a parking lot
 * @param {Object} parkingLotBody
 * @returns {Promise<ParkingLot>}
 */
const createParkingLot = async (parkingLotBody) => {
  if (await ParkingLot.isNameTaken(parkingLotBody.name)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Name already taken');
  }
  Object.assign(parkingLotBody, { availableSpaces: parkingLotBody.spaces });
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
  return ParkingLot.findById(id).populate('owner');
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
  if (updateBody.name && (await ParkingLot.isNameTaken(updateBody.name))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Name already taken');
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
 * @returns {Promise<Array<ParkingLot>>} An array of documents nearest to the given location
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
 * Finds nearest parking lots with available spaces
 * @param {Number} longitude
 * @param {Number} latitude
 * @param {Number} maxDistance (default = 5)
 * @param {String} entryTime
 * @param {String} exitTime
 * @returns {Promise<Array<ParkingLot>>}
 */
const findAvailableSpaces = async (longitude, latitude, maxDistance, entryTime, exitTime) => {
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
    {
      $lookup: {
        from: 'bookings',
        let: { totalSpaces: '$spaces', parkingId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$parkingLotId', '$$parkingId'] },
                  { $gte: ['$entryTime', new Date(entryTime)] },
                  { $lte: ['$exitTime', new Date(exitTime)] },
                ],
              },
            },
          },
          { $group: { _id: null, bookedSpaces: { $sum: '$spaces' } } },
          {
            $addFields: {
              remainingSpaces: { $subtract: ['$$totalSpaces', '$bookedSpaces'] },
            },
          },
          { $project: { remainingSpaces: 1, _id: 0 } },
        ],
        as: 'futureSpaceData',
      },
    },
  ];

  const nearbyParking = await ParkingLot.aggregate(pipeline);
  return nearbyParking;
};

module.exports = {
  createParkingLot,
  getParkingLotById,
  queryParkingLots,
  updateParkingLotById,
  deleteParkingLotById,
  findNearestParkingLot,
  findAvailableSpaces,
};
