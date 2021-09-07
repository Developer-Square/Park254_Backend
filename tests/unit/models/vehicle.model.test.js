const mongoose = require('mongoose');
const { Vehicle } = require('../../../src/models');

describe('Vehicle Model', () => {
  describe('Vehicle validation', () => {
    let newVehicle;
    beforeEach(() => {
      newVehicle = {
        owner: mongoose.Types.ObjectId(),
        plate: 'KAV 897G',
        model: 'Enzo Ferrari',
      };
    });

    test('should correctly validate a valid user', async () => {
      await expect(new Vehicle(newVehicle).validate()).resolves.toBeUndefined();
    });

    test('should throw a validation error if owner is invalid', async () => {
      newVehicle.owner = 'invalid';
      await expect(new Vehicle(newVehicle).validate()).rejects.toThrow();
    });
  });
});
