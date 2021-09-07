const mongoose = require('mongoose');
const { User } = require('.');
const { toJSON, paginate } = require('./plugins');

const vehicleSchema = mongoose.Schema({
  model: {
    type: String,
    required: true,
    trim: true,
  },
  plate: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User,
    required: true,
    trim: true,
  },
});

vehicleSchema.plugin(toJSON);
vehicleSchema.plugin(paginate);

/**
 * Check if number plate is taken
 * @param {string} plate - The vehicle's number plate
 * @param {ObjectId} [excludeVehicleId] - The id of the vehicle to be excluded
 * @returns {Promise<boolean>}
 */
vehicleSchema.statics.isPlateTaken = async function (plate, excludeVehicleId) {
  const vehicle = await this.findOne({ plate: plate.toUpperCase(), _id: { $ne: excludeVehicleId } });
  return !!vehicle;
};

vehicleSchema.pre('save', async function (next) {
  const vehicle = this;
  if (vehicle.isModified('plate')) {
    vehicle.plate = vehicle.plate.toUpperCase();
  }
  next();
});

/**
 * @typedef Vehicle
 */
const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicle;
