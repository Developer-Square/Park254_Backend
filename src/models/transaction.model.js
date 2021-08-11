const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const transactionSchema = mongoose.Schema(
  {
    MerchantRequestID: {
      type: String,
      required: true,
      trim: true,
    },
    CheckoutRequestID: {
      type: String,
      required: true,
      trim: true,
    },
    ResultCode: {
      type: Number,
      required: true,
    },
    ResultDesc: {
      type: String,
      required: true,
      trim: true,
    },
    Amount: Number,
    MpesaReceiptNumber: String,
    TransactionDate: Number,
    PhoneNumber: Number,
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
transactionSchema.plugin(toJSON);
transactionSchema.plugin(paginate);

/**
 * @typedef Transaction
 */
const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
