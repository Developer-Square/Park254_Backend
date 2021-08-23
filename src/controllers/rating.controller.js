const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { ratingService } = require('../services');
const { Rating, User } = require('../models');
const { ParkingLot } = require('../models');
const verifyUser = require('../utils/verifyUser');

const createRating = catchAsync(async (req, res) => {
  await verifyUser(req.user, req.body.userId);
  const query = { userId: req.body.userId, parkingLotId: req.body.parkingLotId };

  const ratedBefore = await Rating.countDocuments(query);

  const parkingLot = await ParkingLot.findById(req.body.parkingLotId);
  if (!parkingLot) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Parking lot not found');
  }

  const user = await User.findById(req.body.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (!ratedBefore) {
    const rating = await ratingService.createRating(req.body);
    await ParkingLot.updateOne(
      { _id: req.body.parkingLotId },
      { $inc: { ratingCount: 1, ratingValue: req.body.value } }
    ).exec();
    res.status(httpStatus.CREATED).send(rating);
  } else {
    await ratingService.updateParkingLot(req.body.userId, req.body.parkingLotId, req.body.value);

    const rating = await ratingService.updateRatingByUserId(req.body.userId, req.body);
    res.status(httpStatus.CREATED).send(rating);
  }
});

const getRatings = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['userId', 'parkingLotId']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await ratingService.queryRatings(filter, options);
  res.send(result);
});

const getRatingById = catchAsync(async (req, res) => {
  const rating = await ratingService.getRatingById(req.params.ratingId);
  if (!rating) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Rating not found');
  }
  res.send(rating);
});

const deleteRatingById = catchAsync(async (req, res) => {
  const rating = await ratingService.getRatingById(req.params.ratingId);
  if (!rating) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Rating not found');
  }
  await verifyUser(req.user, rating.userId);
  await ratingService.deleteRatingById(req.params.ratingId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createRating,
  getRatingById,
  getRatings,
  deleteRatingById,
};
