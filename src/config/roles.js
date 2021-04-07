const roles = ['user', 'vendor', 'admin'];

const roleRights = new Map();
roleRights.set(roles[0], ['getParkingLots', 'getRatings', 'addRatings']);
roleRights.set(roles[1], ['manageParkingLots', 'getRatings', 'getParkingLots']);
roleRights.set(roles[2], [
  'getUsers',
  'manageUsers',
  'getParkingLots',
  'manageParkingLots',
  'getRatings',
  'manageRatings',
  'addRatings',
]);

module.exports = {
  roles,
  roleRights,
};
