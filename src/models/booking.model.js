const mongoose = require('mongoose');
const { ParkingLot, User } = require('.');
const { toJSON, paginate } = require('./plugins');

const min = [1, 'The value of path `{PATH}` ({VALUE}) is beneath the limit ({MIN}).'];

const bookingSchema = new mongoose.Schema(
  {
    parkingLotId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      trim: true,
      ref: ParkingLot,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      trim: true,
      ref: User,
    },
    entryTime: {
      type: Date,
      required: true,
    },
    exitTime: {
      type: Date,
      required: true,
    },
    spaces: {
      type: Number,
      required: true,
      min,
    },
    isCancelled: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// plugin for converting response to JSON
bookingSchema.plugin(toJSON);
bookingSchema.plugin(paginate);

/**
 * @typedef Booking
 */
const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
