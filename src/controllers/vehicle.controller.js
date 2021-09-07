const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { vehicleService } = require('../services');
const { User } = require('../models');
const verifyUser = require('../utils/verifyUser');

const createVehicle = catchAsync(async (req, res) => {
  const user = await User.findById(req.body.owner);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Owner not found');
  }
  await verifyUser(req.user, req.body.owner);
  const vehicle = await vehicleService.createVehicle(req.body);
  res.status(httpStatus.CREATED).send(vehicle);
});

const getVehicles = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['plate', 'owner']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await vehicleService.queryVehicles(filter, options);
  res.send(result);
});

const getVehicle = catchAsync(async (req, res) => {
  const vehicle = await vehicleService.getVehicleById(req.params.vehicleId);
  if (!vehicle) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Vehicle not found');
  }
  await verifyUser(req.user, vehicle.owner);
  res.send(vehicle);
});

const updateVehicle = catchAsync(async (req, res) => {
  const vehicle = await vehicleService.getVehicleById(req.params.vehicleId);
  if (!vehicle) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Vehicle not found');
  }
  await verifyUser(req.user, vehicle.owner);
  const updatedVehicle = await vehicleService.updateVehicleById(req.params.vehicleId, req.body);
  res.send(updatedVehicle);
});

const deleteVehicle = catchAsync(async (req, res) => {
  const vehicle = await vehicleService.getVehicleById(req.params.vehicleId);
  if (!vehicle) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Vehicle not found');
  }
  await verifyUser(req.user, vehicle.owner);
  await vehicleService.deleteVehicleById(req.params.vehicleId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createVehicle,
  getVehicles,
  getVehicle,
  updateVehicle,
  deleteVehicle,
};
