const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

var min = [1, 'The value of path `{PATH}` ({VALUE}) is beneath the limit ({MIN}).'];

const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true
  },
  coordinates: {
    type: [Number],
    required: true
  }
});

const parkingLotSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        spaces: {
            type: Number,
            required: true,
            min: min,
        },
        images: [String],
        location: {
            type: pointSchema,
            index: '2dsphere' // Create a special 2dsphere index on `City.location`
        },
        owner: {
            type: String,
            required: true,
            trim: true,
        },
        ratingValue: {
            type: Number,
        },
        ratingCount: {
            type: Number,
      }
    },
);

// plugin for converting response to JSON
parkingLotSchema.plugin(toJSON);
parkingLotSchema.plugin(paginate);

pointSchema.plugin(toJSON);
pointSchema.plugin(paginate);

/**
 * @typedef ParkingLot
 */
const ParkingLot = mongoose.model('ParkingLot', parkingLotSchema);

module.exports = ParkingLot;
