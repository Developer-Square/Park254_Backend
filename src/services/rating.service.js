const httpStatus = require('http-status');
const { Rating } = require('../models');
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
 * Update rating by id
 * @param {ObjectId} ratingId
 * @param {Object} updateBody
 * @returns {Promise<Rating>}
 */
const updateRatingById = async (ratingId, updateBody) => {
  const rating = await getRatingById(ratingId);
  if (!rating) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Rating not found');
  }
  Object.assign(rating, updateBody);
  await rating.save();
  return rating;
};

/**
 * Update rating by userId
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<Rating>}
 */
const updateRatingByUserId = async (userId, updateBody) => {
  const query = { userId };
  const rating = await Rating.updateOne(query, updateBody);
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
  await Rating.remove();
  return rating;
};

module.exports = {
  createRating,
  getRatingById,
  queryRatings,
  updateRatingById,
  deleteRatingById,
  updateRatingByUserId,
};
