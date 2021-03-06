const mongoose = require('mongoose');
const { Rating } = require('../../src/models');
const { admin, adminThree } = require('./user.fixture');
const { parkingLotOne, parkingLotTwo } = require('./parkingLot.fixture');

const ratingOne = {
  _id: mongoose.Types.ObjectId(),
  userId: admin._id,
  parkingLotId: parkingLotOne._id,
  value: 3,
};

const ratingTwo = {
  _id: mongoose.Types.ObjectId(),
  userId: admin._id,
  parkingLotId: parkingLotOne._id,
  value: 4,
};

const ratingThree = {
  _id: mongoose.Types.ObjectId(),
  userId: adminThree._id,
  parkingLotId: parkingLotTwo._id,
  value: 5,
};

const insertRatings = async (ratings) => {
  await Rating.insertMany(ratings.map((rating) => ({ ...rating })));
};

module.exports = {
  ratingOne,
  ratingTwo,
  ratingThree,
  insertRatings,
};
