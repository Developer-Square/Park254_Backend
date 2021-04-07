const mongoose = require('mongoose');
const faker = require('faker');
const { Rating } = require('../../../src/models');

describe('Rating model', () => {
  describe('Rating validation', () => {
    let newRating;
    beforeEach(() => {
      newRating = {
        _id: mongoose.Types.ObjectId(),
        userId: mongoose.Types.ObjectId(),
        parkingLotId: mongoose.Types.ObjectId(),
        value: faker.random.number({ min: 1, max: 5 }),
      };
    });

    test('should correctly validate a valid rating', async () => {
      await expect(new Rating(newRating).validate()).resolves.toBeUndefined();
    });

    test('should throw a validation error if value is less than 1', async () => {
      newRating.value = 0;
      await expect(new Rating(newRating).validate()).rejects.toThrow();
    });

    test('should throw a validation error if value is more than 5', async () => {
      newRating.value = 6;
      await expect(new Rating(newRating).validate()).rejects.toThrow();
    });
  });
});
