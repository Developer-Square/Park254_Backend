const mongoose = require('mongoose');
const faker = require('faker');
const { Booking } = require('../../../src/models');
const { parkingLotOne } = require('../../fixtures/parkingLot.fixture');
const { userOne } = require('../../fixtures/user.fixture');

describe('Booking model', () => {
  describe('booking validation', () => {
    let newBooking;
    beforeEach(() => {
      const arrivalTime = faker.date.future(1, new Date().toISOString());
      newBooking = {
        _id: mongoose.Types.ObjectId(),
        parkingLotId: parkingLotOne._id,
        clientId: userOne._id,
        entryTime: arrivalTime,
        exitTime: faker.date.future(1, arrivalTime),
        spaces: 2,
      };
    });

    test('should correctly validate a valid booking', async () => {
      await expect(new Booking(newBooking).validate()).resolves.toBeUndefined();
    });

    test('should throw a validation error if parkingLotId is not a mongoId', async () => {
      newBooking.parkingLotId = 'invalid';
      await expect(new Booking(newBooking).validate()).rejects.toThrow();
    });

    test('should throw a validation error if clientId is not a mongoId', async () => {
      newBooking.clientId = 'invalid';
      await expect(new Booking(newBooking).validate()).rejects.toThrow();
    });

    test('should throw a validation error if spaces is less than 1', async () => {
      newBooking.spaces = 0;
      await expect(new Booking(newBooking).validate()).rejects.toThrow();
    });
  });
});
