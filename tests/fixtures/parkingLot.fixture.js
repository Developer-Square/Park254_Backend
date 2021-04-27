const mongoose = require('mongoose');
const faker = require('faker');
const { ParkingLot } = require('../../src/models');
const { admin, adminTwo } = require('./user.fixture');

const parkingLotOne = {
  _id: '6ebac534954b54139806c582',
  name: 'Holy Basilica Basement Parking',
  spaces: 800,
  images: [faker.internet.url(), faker.internet.url(), faker.internet.url()],
  location: { type: 'Point', coordinates: [36.820705549603176, -1.287298370209058], _id: '7ebac534954b54139806c582' },
  owner: admin._id,
};

const parkingLotTwo = {
  _id: mongoose.Types.ObjectId(),
  name: faker.lorem.sentence(5),
  spaces: 50,
  images: [faker.internet.url(), faker.internet.url(), faker.internet.url()],
  location: { type: 'Point', coordinates: [36.8257173099633, -1.2891936094897558], _id: '7ebac534954b54139806c583' },
  owner: admin._id,
};

const parkingLotThree = {
  _id: mongoose.Types.ObjectId(),
  name: faker.lorem.sentence(5),
  spaces: 8,
  images: [faker.internet.url(), faker.internet.url(), faker.internet.url()],
  location: { type: 'Point', coordinates: [36.077786996726054, -0.2859759683357454], _id: '7ebac534954b54139806c584' },
  owner: adminTwo._id,
};

const insertParkingLots = async (parkingLots) => {
  await ParkingLot.insertMany(parkingLots.map((parkingLot) => ({ ...parkingLot })));
};

module.exports = {
  parkingLotOne,
  parkingLotTwo,
  parkingLotThree,
  insertParkingLots,
};
