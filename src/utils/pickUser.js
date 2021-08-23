/**
 * Returns user id from an object
 * @param {Object} object
 * @param {string[]} keys
 * @returns {Object}
 */
const pickUser = (object, key) => {
  if (object && Object.prototype.hasOwnProperty.call(object, key)) {
    return object[key];
  }
};

module.exports = pickUser;
