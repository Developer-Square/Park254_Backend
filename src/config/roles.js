const roles = ['user', 'vendor', 'admin'];

const roleRights = new Map();
roleRights.set(roles[0], [
  'getParkingLots',
  'getRatings',
  'addRatings',
  'pay',
  'getTransactions',
  'getBookings',
  'manageBookings',
  'getVehicles',
  'manageVehicles',
]);
roleRights.set(roles[1], [
  'manageParkingLots',
  'getRatings',
  'getParkingLots',
  'pay',
  'getTransactions',
  'getVehicles',
  'manageVehicles',
  'getBookings',
]);
roleRights.set(roles[2], [
  'getUsers',
  'manageUsers',
  'getParkingLots',
  'manageParkingLots',
  'getRatings',
  'manageRatings',
  'addRatings',
  'pay',
  'getTransactions',
  'manageTransactions',
  'getBookings',
  'manageBookings',
  'getVehicles',
  'manageVehicles',
]);

module.exports = {
  roles,
  roleRights,
};
