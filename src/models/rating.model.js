const mongoose = require('mongoose');
const { User, ParkingLot } = require('.');
const { toJSON, paginate } = require('./plugins');

const ratingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User,
    required: true,
    trim: true,
  },
  parkingLotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ParkingLot,
    required: true,
    trim: true,
  },
  value: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
});

ratingSchema.plugin(toJSON);
ratingSchema.plugin(paginate);

/**
 * @typedef Rating
 */
const Rating = mongoose.model('Rating', ratingSchema);

module.exports = Rating;
