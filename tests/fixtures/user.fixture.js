const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const faker = require('faker');
const User = require('../../src/models/user.model');

const password = 'password1';
const salt = bcrypt.genSaltSync(8);
const hashedPassword = bcrypt.hashSync(password, salt);

const userOne = {
  _id: mongoose.Types.ObjectId(),
  name: faker.name.findName(),
  email: faker.internet.email().toLowerCase(),
  password,
  role: 'user',
  phone: 12345,
};

const userTwo = {
  _id: mongoose.Types.ObjectId(),
  name: faker.name.findName(),
  email: faker.internet.email().toLowerCase(),
  password,
  role: 'user',
  phone: 123456,
};

const admin = {
  _id: '5ebac534954b54139806c582',
  name: faker.name.findName(),
  email: faker.internet.email().toLowerCase(),
  password,
  role: 'admin',
  phone: 12346,
};

const adminTwo = {
  _id: '5ebac534954b54139806c583',
  name: faker.name.findName(),
  email: faker.internet.email().toLowerCase(),
  password,
  role: 'admin',
  phone: 12348,
};

const adminThree = {
  _id: '5ebac534954b54139806c584',
  name: faker.name.findName(),
  email: faker.internet.email().toLowerCase(),
  password,
  role: 'admin',
  phone: 2348,
};

const vendor = {
  _id: '5ebac534954b54139806c585',
  name: faker.name.findName(),
  email: faker.internet.email().toLowerCase(),
  password,
  role: 'vendor',
  phone: 12349,
};

const insertUsers = async (users) => {
  await User.insertMany(users.map((user) => ({ ...user, password: hashedPassword })));
};

module.exports = {
  userOne,
  userTwo,
  admin,
  adminTwo,
  adminThree,
  vendor,
  insertUsers,
};
