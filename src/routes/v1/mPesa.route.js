const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const transactionController = require('../../controllers/transaction.controller');
const transactionValidation = require('../../validations/transaction.validation');

const router = express.Router();

router
  .route('/')
  .post(transactionController.createTransaction)
  .get(auth('getTransactions'), validate(transactionValidation.fetchTransaction), transactionController.fetchTransaction);

module.exports = router;
