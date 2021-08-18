const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const ratingSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      trim: true,
    },
    parkingLotId: {
      type: String,
      required: true,
      trim: true,
    },
    value: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

ratingSchema.plugin(toJSON);
ratingSchema.plugin(paginate);

/**
 * @typedef Rating
 */
const Rating = mongoose.model('Rating', ratingSchema);

module.exports = Rating;
