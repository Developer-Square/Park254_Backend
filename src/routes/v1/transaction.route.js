const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const transactionController = require('../../controllers/transaction.controller');
const transactionValidation = require('../../validations/transaction.validation');

const router = express.Router();

router
  .route('/')
  .post(auth('pay'), validate(transactionValidation.pay), transactionController.pay)
  .get(auth('getTransactions'), validate(transactionValidation.getTransactions), transactionController.getTransactions);

router
  .route('/:transactionId')
  .get(auth('getTransactions'), validate(transactionValidation.getTransaction), transactionController.getTransaction)
  .delete(
    auth('manageTransactions'),
    validate(transactionValidation.deleteTransaction),
    transactionController.deleteTransaction
  );

module.exports = router;
