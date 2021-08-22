const mongoose = require('mongoose');
const faker = require('faker');
const { Booking } = require('../../src/models');
const { admin, userOne } = require('./user.fixture');
const { parkingLotOne, parkingLotTwo } = require('./parkingLot.fixture');

const arrivalTime = faker.date.future(1, new Date().toISOString());

const bookingOne = {
  _id: '6ebac534954b54139806c678',
  parkingLotId: parkingLotOne._id,
  clientId: userOne._id,
  entryTime: '2021-08-22T11:27:20.381Z',
  exitTime: '2021-08-22T13:27:20.381Z',
  spaces: 22,
  isCancelled: false,
};

const bookingTwo = {
  _id: mongoose.Types.ObjectId(),
  parkingLotId: parkingLotTwo._id,
  clientId: userOne._id,
  entryTime: arrivalTime,
  exitTime: faker.date.future(1, arrivalTime),
  spaces: 33,
  isCancelled: false,
};

const bookingThree = {
  _id: mongoose.Types.ObjectId(),
  parkingLotId: parkingLotOne._id,
  clientId: admin._id,
  entryTime: arrivalTime,
  exitTime: faker.date.future(1, arrivalTime),
  spaces: 55,
  isCancelled: true,
};

const bookingFour = {
  _id: '6ebac534954b54139806c679',
  parkingLotId: parkingLotOne._id,
  clientId: userOne._id,
  entryTime: '2021-08-22T11:27:20.381Z',
  exitTime: '2021-08-22T13:27:20.381Z',
  spaces: 800,
  isCancelled: false,
};

const insertBookings = async (bookings) => {
  await Booking.insertMany(bookings.map((booking) => ({ ...booking })));
};

module.exports = {
  bookingOne,
  bookingTwo,
  bookingThree,
  bookingFour,
  insertBookings,
};
