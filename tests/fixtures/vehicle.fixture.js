const mongoose = require('mongoose');
const { Vehicle } = require('../../src/models');
const { userOne, admin } = require('./user.fixture');

const vehicleOne = {
  _id: mongoose.Types.ObjectId(),
  owner: userOne._id,
  plate: 'KAW 674M',
  model: 'Nissan B15',
};

const vehicleTwo = {
  _id: mongoose.Types.ObjectId(),
  owner: userOne._id,
  plate: 'KDA 782M',
  model: 'Nissan Note',
};

const vehicleThree = {
  _id: mongoose.Types.ObjectId(),
  owner: admin._id,
  plate: 'KBD 018G',
  model: 'Suzuki Escudo',
};

const insertVehicles = async (vehicles) => {
  await Vehicle.insertMany(vehicles.map((vehicle) => ({ ...vehicle })));
};

module.exports = {
  vehicleOne,
  vehicleTwo,
  vehicleThree,
  insertVehicles,
};
