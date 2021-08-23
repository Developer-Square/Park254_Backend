const httpStatus = require('http-status');
const ApiError = require('./ApiError');

/**
 * Verifies whether user owns an item
 * @param {Object} user user details
 * @param {String} userId
 * @returns {Promise}
 */
const verifyUser = (user, userId) =>
  new Promise((resolve, reject) =>
    user.role === 'admin' || user._id.toString() === userId.toString()
      ? resolve()
      : reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'))
  );

module.exports = verifyUser;
