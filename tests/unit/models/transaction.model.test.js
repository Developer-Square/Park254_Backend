const mongoose = require('mongoose');
const faker = require('faker');
const { Transaction } = require('../../../src/models');

describe('transaction model', () => {
  describe('transaction validation', () => {
    let newTransaction;
    beforeEach(() => {
      newTransaction = {
        _id: mongoose.Types.ObjectId(),
        MerchantRequestID: faker.lorem.word(),
        CheckoutRequestID: faker.lorem.word(),
        ResultCode: 1,
        ResultDesc: faker.lorem.sentence(),
        Amount: 500,
        MpesaReceiptNumber: faker.lorem.word(),
        TransactionDate: 20210819123456,
        PhoneNumber: 254792695000,
      };
    });

    test('should correctly validate a valid transaction', async () => {
      await expect(new Transaction(newTransaction).validate()).resolves.toBeUndefined();
    });
  });
});
