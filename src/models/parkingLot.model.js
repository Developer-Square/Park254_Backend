const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const min = [1, 'The value of path `{PATH}` ({VALUE}) is beneath the limit ({MIN}).'];

const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true,
  },
  coordinates: {
    type: [Number],
    required: true,
  },
});

const parkingLotSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  spaces: {
    type: Number,
    required: true,
    min,
  },
  images: [String],
  location: {
    type: pointSchema,
    index: '2dsphere', // Create a special 2dsphere index on `City.location`
  },
  owner: {
    type: String,
    required: true,
    trim: true,
  },
  ratingValue: {
    type: Number,
    default: 0,
  },
  ratingCount: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    required: true,
    min,
  },
  city: {
    type: String,
    default: 'Nairobi',
    trim: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
});

// plugin for converting response to JSON
parkingLotSchema.plugin(toJSON);
parkingLotSchema.plugin(paginate);

pointSchema.plugin(toJSON);
pointSchema.plugin(paginate);

/**
 * Check if parking lot name is taken
 * @param {string} name - The name of the parking lot
 * @param {mongoose.ObjectId} [excludeParkingLotId]- The id of the parking lot to be excluded
 * @returns {Promise<boolean>}
 */
parkingLotSchema.statics.isNameTaken = async function (name, excludeParkingLotId) {
  const lot = await this.findOne({ name, _id: { $ne: excludeParkingLotId } });
  return !!lot;
};

/**
 * @typedef ParkingLot
 */
const ParkingLot = mongoose.model('ParkingLot', parkingLotSchema);

module.exports = ParkingLot;
