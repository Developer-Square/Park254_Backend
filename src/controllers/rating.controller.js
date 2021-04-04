const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { ratingService } = require('../services');
const { Rating, User } = require('../models');
const { ParkingLot } = require('../models');

const createRating = catchAsync(async(req, res) => {
    const query = {userId : req.body.userId, parkingLotId : req.body.parkingLotId};

    const ratedBefore = await Rating.countDocuments(query);

    const parkingLot = await ParkingLot.findById(req.body.parkingLotId);
    if(!parkingLot){
        throw new ApiError(httpStatus.NOT_FOUND, 'Parking lot not found');
    }

    const user = await User.findById(req.body.userId);
    if(!user){
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    if(!ratedBefore){
        const rating = await ratingService.createRating(req.body);
        const updateInfo = await ParkingLot.updateOne({'_id':req.body.parkingLotId}, {$inc : {'ratingCount' : 1, 'ratingValue' : req.body.value}}).exec();
        res.status(httpStatus.CREATED).send({rating, updateInfo});
    } else {
        const previousRating = await Rating.find(query);

        if(!previousRating){
            throw new ApiError(httpStatus.NOT_FOUND, 'Previous rating not found');
        }

        let updateDecrementInfo;
        Promise.all([previousRating]).then(async(values) => {

            const value = values[0][0].value;
            updateDecrementInfo = await ParkingLot.updateOne({'_id':req.body.parkingLotId}, {$inc : {'ratingValue' : -(value)}}).exec();
        });

        const updateIncrementInfo = await ParkingLot.updateOne({'_id':req.body.parkingLotId}, {$inc : {'ratingValue' : req.body.value}}).exec();
        const rating = await ratingService.updateRatingByUserId(req.body.userId, req.body);
        res.send({rating, updateIncrementInfo, updateDecrementInfo});
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

const updateRatingById = catchAsync(async (req, res) => {
    const rating = await ratingService.updateRatingById(req.params.ratingId, req.body);
    res.send(rating);
});

const deleteRatingById = catchAsync(async (req, res) => {
    await ratingService.deleteRatingById(req.params.ratingId);
    res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
    createRating,
    getRatingById,
    getRatings,
    updateRatingById,
    deleteRatingById,
}
