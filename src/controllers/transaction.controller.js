/* eslint-disable no-console */
const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { transactionService } = require('../services');
const { Transaction } = require('../models');

const pay = catchAsync(async (req, res) => {
  transactionService.pay(req.body.amount, req.body.phoneNumber);
  res.status(httpStatus.OK).send();
});

const createTransaction = catchAsync(async (req, res) => {
  await transactionService.createTransaction(req.body);
  res.status(httpStatus.OK).send();
});

const fetchTransaction = catchAsync(async (req, res) => {
  const filter = {
    PhoneNumber: req.query.PhoneNumber,
    Amount: req.query.Amount,
    createdAt: { $gte: new Date(req.query.createdAt) },
  };
  let transaction;
  do {
    // eslint-disable-next-line no-await-in-loop
    transaction = await Transaction.find(filter);
  } while (transaction.length === 0);
  res.send({ transaction: transaction[0] });
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
  pay,
  getTransactions,
  getTransaction,
  deleteTransaction,
  createTransaction,
  fetchTransaction,
};
