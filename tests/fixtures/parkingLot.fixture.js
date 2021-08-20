const mongoose = require('mongoose');
const faker = require('faker');
const { ParkingLot } = require('../../src/models');
const { admin, adminTwo } = require('./user.fixture');

const parkingLotOne = {
  _id: '6ebac534954b54139806c582',
  name: 'Holy Basilica Basement Parking',
  spaces: 800,
  availableSpaces: 800,
  images: [faker.internet.url(), faker.internet.url(), faker.internet.url()],
  location: { type: 'Point', coordinates: [36.820705549603176, -1.287298370209058], _id: '7ebac534954b54139806c582' },
  owner: admin._id,
  price: 200,
  address: 'Tom Mboya Street',
};

const parkingLotTwo = {
  _id: mongoose.Types.ObjectId(),
  name: faker.lorem.sentence(5),
  spaces: 50,
  availableSpaces: 50,
  images: [faker.internet.url(), faker.internet.url(), faker.internet.url()],
  location: { type: 'Point', coordinates: [36.8257173099633, -1.2891936094897558], _id: '7ebac534954b54139806c583' },
  owner: admin._id,
  price: 300,
  address: 'Harambee Avenue',
};

const parkingLotThree = {
  _id: mongoose.Types.ObjectId(),
  name: faker.lorem.sentence(5),
  spaces: 8,
  availableSpaces: 8,
  images: [faker.internet.url(), faker.internet.url(), faker.internet.url()],
  location: { type: 'Point', coordinates: [36.077786996726054, -0.2859759683357454], _id: '7ebac534954b54139806c584' },
  owner: adminTwo._id,
  price: 500,
  address: 'James Gichuru Road',
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
