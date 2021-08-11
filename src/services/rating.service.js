const httpStatus = require('http-status');
const { Rating, ParkingLot } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a new rating
 * @param {Object} ratingBody
 * @returns {Promise<Rating>}
 */
const createRating = async (ratingBody) => {
  const rating = await Rating.create(ratingBody);
  return rating;
};

/**
 * Query for ratings
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryRatings = async (filter, options) => {
  const ratings = await Rating.paginate(filter, options);
  return ratings;
};

/**
 * Get rating by id
 * @param {ObjectId} id
 * @returns {Promise<Rating>}
 */
const getRatingById = async (id) => {
  return Rating.findById(id);
};

/**
 * Update rating by userId
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<Rating>}
 */
const updateRatingByUserId = async (userId, updateBody) => {
  const query = { userId };
  const rating = await Rating.findOne(query);
  if (!rating) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Rating not found');
  }
  Object.assign(rating, updateBody);
  await rating.save();
  return rating;
};

/**
 * Delete rating by id
 * @param {ObjectId} ratingId
 * @returns {Promise<Rating>}
 */
const deleteRatingById = async (ratingId) => {
  const rating = await getRatingById(ratingId);
  if (!rating) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Rating not found');
  }
  await rating.remove();
  return rating;
};

/**
 * Populate parking lot rating values after update
 * @param {String} userId
 * @param {String} parkingLotId
 * @param {Number} newValue
 */
const updateParkingLot = async (userId, parkingLotId, newValue) => {
  const query = { userId, parkingLotId };
  const previousRating = await Rating.find(query);

  Promise.all([previousRating]).then(async (values) => {
    const { value } = values[0][0];

    await ParkingLot.updateOne({ _id: parkingLotId }, { $inc: { ratingValue: newValue - value } }).exec();
  });
};

const getRatingCounts = async (parkingLotId) => {
  const rating5Count = await Rating.countDocuments({ value: 5, parkingLotId });
  const rating4Count = await Rating.countDocuments({ value: 4, parkingLotId });
  const rating3Count = await Rating.countDocuments({ value: 3, parkingLotId });
  const rating2Count = await Rating.countDocuments({ value: 2, parkingLotId });
  const rating1Count = await Rating.countDocuments({ value: 1, parkingLotId });
  const totalCount = await Rating.countDocuments({ parkingLotId });

  return Promise.all([rating1Count, rating2Count, rating3Count, rating4Count, rating5Count, totalCount]).then((values) => {
    return {
      1: values[0],
      2: values[1],
      3: values[2],
      4: values[3],
      5: values[4],
      count: values[5],
    };
  });
};

module.exports = {
  createRating,
  getRatingById,
  queryRatings,
  deleteRatingById,
  updateRatingByUserId,
  updateParkingLot,
  getRatingCounts,
};
