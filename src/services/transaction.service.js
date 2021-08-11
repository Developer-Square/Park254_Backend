/* eslint-disable no-console */
const httpStatus = require('http-status');
const { Transaction } = require('../models');
const ApiError = require('../utils/ApiError');
const mPesa = require('../mPesa/config');

/**
 * Lipa na mPesa
 * @param {Number} amount - the amount to be sent
 * @param {Number} phoneNumber - the phone number of the sender
 * @returns {Boolean} true
 */
const pay = async (amount, phoneNumber) => {
  const accountRef = Math.random().toString(35).substr(2, 7);
  await mPesa.lipaNaMpesaOnline(
    phoneNumber,
    amount,
    `https://park254-parking-app-server.herokuapp.com/v1/mpesaWebHook`,
    accountRef
  );
  return true;
};

/**
 * Create a transaction
 * @param {Object} transactionBody - the body of the transaction
 * @returns {Promise<Transaction>}
 */
const createTransaction = async (transactionBody) => {
  const transaction = new Transaction();
  const body = transactionBody.Body.stkCallback;
  transaction._id = body.CallbackMetadata.Item[1].Value;
  transaction.MerchantRequestID = body.MerchantRequestID;
  transaction.CheckoutRequestID = body.CheckoutRequestID;
  transaction.ResultCode = body.ResultCode;
  transaction.ResultDesc = body.ResultDesc;
  if (body.ResultCode === 0) {
    transaction.Amount = body.CallbackMetadata.Item[0].Value;
    transaction.MpesaReceiptNumber = body.CallbackMetadata.Item[1].Value;
    transaction.TransactionDate = body.CallbackMetadata.Item[2].Value;
    transaction.PhoneNumber = body.CallbackMetadata.Item[3].Value;
  }
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
