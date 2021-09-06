const httpStatus = require('http-status');
const { userService } = require('.');
const { Vehicle, User } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a vehicle
 * @param {Object} vehicleBody
 * @returns {Promise<Vehicle>}
 */
const createVehicle = async (vehicleBody) => {
  if (await Vehicle.isPlateTaken(vehicleBody.plate)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Number plate already taken');
  }
  const owner = await userService.getUserById(vehicleBody.owner);
  if (!owner) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Owner does not exist');
  }
  const vehicle = await Vehicle.create(vehicleBody);
  return vehicle;
};

/**
 * Query for vehicles
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryVehicles = async (filter, options) => {
  const vehicles = await Vehicle.paginate(filter, options);
  return vehicles;
};

/**
 * Get vehicle by id
 * @param {ObjectId} id
 * @returns {Promise<Vehicle>}
 */
const getVehicleById = async (id) => {
  return Vehicle.findById(id);
};

/**
 * Update vehicle by id
 * @param {ObjectId} vehicleId
 * @param {Object} updateBody
 * @returns {Promise<Vehicle>}
 */
const updateVehicleById = async (vehicleId, updateBody) => {
  const vehicle = await getVehicleById(vehicleId);
  if (updateBody.plate && (await Vehicle.isPlateTaken(updateBody.plate, vehicleId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Plate already taken');
  }
  if (updateBody.owner && (await User.doesNotExist(updateBody.owner))) {
    throw new ApiError(httpStatus.NOT_FOUND, 'New owner does not exist');
  }
  Object.assign(vehicle, updateBody);
  await vehicle.save();
  return vehicle;
};

/**
 * Delete vehicle by id
 * @param {ObjectId} vehicleId
 * @returns {Promise<Vehicle>}
 */
const deleteVehicleById = async (vehicleId) => {
  const vehicle = await getVehicleById(vehicleId);
  await vehicle.remove();
  return vehicle;
};

module.exports = {
  createVehicle,
  queryVehicles,
  getVehicleById,
  updateVehicleById,
  deleteVehicleById,
};
