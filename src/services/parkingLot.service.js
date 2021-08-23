const httpStatus = require('http-status');
const mongoose = require('mongoose');
const { ParkingLot, Booking } = require('../models');
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
 * Finds parking lots with available spaces
 * @param {Array<String>} parkingLots
 * @param {String} entryTime
 * @param {String} exitTime
 * @returns {Promise<Array<{id: String, occupiedSpaces: Number, availableSpaces: Number, available: Boolean}>>}
 */
const findAvailableSpaces = async (parkingLots, entryTime, exitTime) => {
  const parkingLotIds = parkingLots.map((parkingLotId) => new mongoose.Types.ObjectId(parkingLotId));
  const pipeline = [
    {
      $match: {
        entryTime: { $lte: new Date(exitTime) },
        exitTime: { $gt: new Date(entryTime) },
        parkingLotId: { $in: parkingLotIds },
      },
    },
    {
      $lookup: {
        from: 'parkinglots',
        localField: 'parkingLotId',
        foreignField: '_id',
        as: 'parkingLot',
      },
    },
    {
      $unwind: '$parkingLot',
    },
    {
      $group: {
        _id: '$parkingLotId',
        occupiedSpaces: { $sum: '$spaces' },
        totalSpaces: { $first: '$parkingLot.spaces' },
      },
    },
    {
      $addFields: {
        availableSpaces: { $subtract: ['$totalSpaces', '$occupiedSpaces'] },
      },
    },
    {
      $project: {
        id: '$_id',
        _id: 0,
        occupiedSpaces: 1,
        availableSpaces: 1,
        available: { $gt: ['$availableSpaces', 0] },
      },
    },
  ];

  const availableSpaces = await Booking.aggregate(pipeline);
  return availableSpaces;
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
