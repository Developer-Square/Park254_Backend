const mongoose = require('mongoose');
const faker = require('faker');
const { ParkingLot } = require('../../../src/models');

describe('Parking lot model', () => {
  describe('Parking lot validation', () => {
    let newParkingLot;
    beforeEach(() => {
      newParkingLot = {
        _id: mongoose.Types.ObjectId(),
        name: faker.lorem.sentence(5),
        spaces: 50,
        availableSpaces: 50,
        images: [faker.internet.url(), faker.internet.url(), faker.internet.url()],
        location: { type: 'Point', coordinates: [36.8257173099633, -1.2891936094897558] },
        owner: mongoose.Types.ObjectId(),
        price: 200,
        address: 'Tom Mboya Street',
        city: 'Nairobi',
      };
    });

    test('should correctly validate a valid parking lot', async () => {
      await expect(new ParkingLot(newParkingLot).validate()).resolves.toBeUndefined();
    });

    test('should throw a validation error if spaces is less than 1', async () => {
      newParkingLot.spaces = 0;
      await expect(new ParkingLot(newParkingLot).validate()).rejects.toThrow();
    });

    test('should throw a validation error if location is not of type "Point"', async () => {
      newParkingLot.location.type = 'invalid';
      await expect(new ParkingLot(newParkingLot).validate()).rejects.toThrow();
    });
  });
});
