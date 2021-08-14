/**
 * Selects value of property from object in array that matches name property
 * @param {Array} arr array where the value is picked
 * @param {String} name property that is used to filter array
 * @returns Value of property from object in array that matches name property
 * @example pickValue(arr, 'PhoneNumber');
 */
const pickValue = (arr, name) => arr.filter((item) => item.Name === name)[0].Value;

module.exports = pickValue;
