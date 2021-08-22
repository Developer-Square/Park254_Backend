const faker = require('faker');
const { Transaction } = require('../../src/models');

const transactionOne = {
  _id: '29115-34620561-1',
  MerchantRequestID: '29115-34620561-1',
  CheckoutRequestID: faker.lorem.word(),
  ResultCode: 0,
  ResultDesc: faker.lorem.sentence(),
  Amount: 500,
  MpesaReceiptNumber: faker.lorem.word(),
  TransactionDate: 20210819123456,
  PhoneNumber: 254792695000,
};

const transactionTwo = {
  _id: '29115-34620561-2',
  MerchantRequestID: '29115-34620561-2',
  CheckoutRequestID: faker.lorem.word(),
  ResultCode: 0,
  ResultDesc: faker.lorem.sentence(),
  Amount: 350,
  MpesaReceiptNumber: faker.lorem.word(),
  TransactionDate: 20210819123456,
  PhoneNumber: 254778901044,
};

const transactionThree = {
  _id: '29115-34620561-3',
  MerchantRequestID: '29115-34620561-3',
  CheckoutRequestID: faker.lorem.word(),
  ResultCode: 1032,
  ResultDesc: 'The transaction was cancelled by the user',
};

const insertTransactions = async (transactions) => {
  await Transaction.insertMany(transactions.map((transaction) => ({ ...transaction })));
};

module.exports = {
  transactionOne,
  transactionTwo,
  transactionThree,
  insertTransactions,
};
