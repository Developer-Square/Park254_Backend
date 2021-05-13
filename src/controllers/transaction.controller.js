const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { transactionService } = require('../services');

const createTransaction = catchAsync(async (req, res) => {
  const transaction = await transactionService.createTransaction(req.body.amount, req.body.phoneNumber);
  res.status(httpStatus.CREATED).send(transaction);
});

const getTransactions = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['PhoneNumber']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await transactionService.queryTransactions(filter, options);
  res.send(result);
});

const getTransaction = catchAsync(async (req, res) => {
  const transaction = await transactionService.getTransactionById(req.params.transactionId);
  if (!transaction) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Transaction not found');
  }
  res.send(transaction);
});

const deleteTransaction = catchAsync(async (req, res) => {
  await transactionService.deleteTransactionById(req.params.transactionId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createTransaction,
  getTransactions,
  getTransaction,
  deleteTransaction,
};
