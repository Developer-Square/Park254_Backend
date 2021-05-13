const roles = ['user', 'vendor', 'admin'];

const roleRights = new Map();
roleRights.set(roles[0], ['getParkingLots', 'getRatings', 'addRatings', 'pay', 'getTransactions']);
roleRights.set(roles[1], ['manageParkingLots', 'getRatings', 'getParkingLots', 'pay', 'getTransactions']);
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
]);

module.exports = {
  roles,
  roleRights,
};
