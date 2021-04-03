const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { parkingLotService } = require('../services');

const createParkingLot = catchAsync(async(req, res) => {
    const parkingLot = await parkingLotService.createParkingLot(req.body);
    res.status(httpStatus.CREATED).send(parkingLot);
});

const getParkingLots = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['name', 'owner']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const result = await parkingLotService.queryParkingLots(filter, options);
    res.send(result);
});

const getParkingLotById = catchAsync(async (req, res) => {
    const parkingLot = await parkingLotService.getParkingLotById(req.params.parkingLotId);
    if (!parkingLot) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Parking lot not found');
    }
    res.send(parkingLot);
});

const updateParkingLotById = catchAsync(async (req, res) => {
    const parkingLot = await parkingLotService.updateParkingLotById(req.params.parkingLotId, req.body);
    res.send(parkingLot);
});

const deleteParkingLotById = catchAsync(async (req, res) => {
    await parkingLotService.deleteParkingLotById(req.params.parkingLotId);
    res.status(httpStatus.NO_CONTENT).send();
});

const findNearestParkingLot = catchAsync(async (req, res) => {
    const nearestLocations = await parkingLotService.findNearestParkingLot(req.query.longitude, req.query.latitude, req.query.maxDistance);
    if(!nearestLocations){
        throw new ApiError(httpStatus.NOT_FOUND, 'Parking lot not found');
    }
    res.send(nearestLocations);
});

module.exports = {
    createParkingLot,
    getParkingLotById,
    getParkingLots,
    updateParkingLotById,
    deleteParkingLotById,
    findNearestParkingLot,
}
