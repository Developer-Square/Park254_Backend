/* eslint-disable no-console */
const httpStatus = require('http-status');
const { Transaction } = require('../models');
const ApiError = require('../utils/ApiError');
const mPesa = require('../mPesa/config');

/**
 * Lipa na mPesa
 * @param {Number} amount - the amount to be sent
 * @param {Number} phoneNumber - the phone number of the sender
 */
const pay = async (amount, phoneNumber) => {
  const accountRef = Math.random().toString(35).substr(2, 7);
  await mPesa.lipaNaMpesaOnline(
    phoneNumber,
    amount,
    `https://park254-parking-app-server.herokuapp.com/v1/mpesaWebHook`,
    accountRef
  );
};

/**
 * Create a transaction
 * @param {Object} transactionBody - the body of the transaction
 * @returns {Promise<Transaction>}
 */
const createTransaction = async (transactionBody) => {
  const transaction = new Transaction();
  transaction.MerchantRequestID = transactionBody.MerchantRequestID;
  transaction.CheckoutRequestID = transactionBody.CheckoutRequestID;
  transaction.ResultCode = transactionBody.ResultCode;
  transaction.ResultDesc = transactionBody.ResultDesc;
  transaction.Amount = transactionBody.CallbackMetadata.Amount;
  transaction.MpesaReceiptNumber = transactionBody.CallbackMetadata.MpesaReceiptNumber;
  transaction.Balance = transactionBody.CallbackMetadata.Balance;
  transaction.TransactionDate = transactionBody.CallbackMetadata.TransactionDate;
  transaction.PhoneNumber = transactionBody.CallbackMetadata.PhoneNumber;
  await transaction.save();
  return transaction;
};

/**
 * Query for transactions
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryTransactions = async (filter, options) => {
  const transactions = await Transaction.paginate(filter, options);
  return transactions;
};

/**
 * Get transaction by id
 * @param {ObjectId} id
 * @returns {Promise<Transaction>}
 */
const getTransactionById = async (id) => {
  return Transaction.findById(id);
};

/**
 * Delete transaction by id
 * @param {ObjectId} transactionId
 * @returns {Promise<Transaction>}
 */
const deleteTransactionById = async (transactionId) => {
  const transaction = await getTransactionById(transactionId);
  if (!transaction) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Transaction not found');
  }
  await transaction.remove();
  return transaction;
};

module.exports = {
  pay,
  queryTransactions,
  getTransactionById,
  deleteTransactionById,
  createTransaction,
};
