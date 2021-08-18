const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { User } = require('.');

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

const featureSchema = new mongoose.Schema({
  accessibleParking: {
    type: Boolean,
    default: false,
  },
  cctv: {
    type: Boolean,
    default: false,
  },
  evCharging: {
    type: Boolean,
    default: false,
  },
  carWash: {
    type: Boolean,
    default: false,
  },
  valetParking: {
    type: Boolean,
    default: false,
  },
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
      min,
    },
    availableSpaces: {
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
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      trim: true,
      ref: User,
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
    features: {
      type: featureSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  }
);

// plugin for converting response to JSON
parkingLotSchema.plugin(toJSON);
parkingLotSchema.plugin(paginate);

featureSchema.plugin(toJSON);
featureSchema.plugin(paginate);

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
