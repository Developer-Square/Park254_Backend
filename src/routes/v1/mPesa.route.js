const express = require('express');
const transactionController = require('../../controllers/transaction.controller');

const router = express.Router();

router.route('/').post(transactionController.receiveTransaction);

module.exports = router;
