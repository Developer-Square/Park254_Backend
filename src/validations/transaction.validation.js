const Joi = require('joi');

const pay = {
  body: Joi.object().keys({
    amount: Joi.number().min(1).required(),
    phoneNumber: Joi.number().required(),
  }),
};

const getTransactions = {
  query: Joi.object().keys({
    PhoneNumber: Joi.number(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const fetchTransaction = {
  query: Joi.object().keys({
    PhoneNumber: Joi.number().required(),
    Amount: Joi.number().min(1).required(),
    createdAt: Joi.string().required(),
  }),
};

const getTransaction = {
  params: Joi.object().keys({
    transactionId: Joi.string(),
  }),
};

const deleteTransaction = {
  params: Joi.object().keys({
    transactionId: Joi.string(),
  }),
};

module.exports = {
  pay,
  getTransactions,
  getTransaction,
  deleteTransaction,
  fetchTransaction,
};
