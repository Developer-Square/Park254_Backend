/* eslint-disable no-console */
const httpStatus = require('http-status');
const mpesa = require('../config/mpesa.config');
const { Transaction } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a transaction
 * @param {Number} amount - the amount to be sent
 * @param {Number} phoneNumber - the phone number of the sender
 * @param {String} accountReference - Any Reference or ID that you would what to associate the transaction with
 * @param {String} transactionDesc - Any Description that you would what to associate the transaction with
 * @returns {Promise<Transaction>}
 */
const createTransaction = async (amount, phoneNumber, accountReference, transactionDesc) => {
  mpesa
    .sktPush(amount, phoneNumber, accountReference, transactionDesc)
    .then((result) => result)
    .catch((error) => error);
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
  createTransaction,
  queryTransactions,
  getTransactionById,
  deleteTransactionById,
};
