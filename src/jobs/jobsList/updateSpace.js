const httpStatus = require('http-status');
const { parkingLotService } = require('../../services');
const ApiError = require('../../utils/ApiError');

module.exports = (agenda) => {
  agenda.define('Update parking lot spaces', async (job, done) => {
    const { parkingLotId } = job.attrs.data;
    const { spaces } = job.attrs.data;
    const { add } = job.attrs.data;
    const parkingLot = await parkingLotService.getParkingLotById(parkingLotId);
    if (!parkingLot) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Parking lot not found');
    }
    if (add) {
      parkingLot.availableSpaces += spaces;
    } else {
      parkingLot.availableSpaces -= spaces;
    }
    await parkingLot.save();

    done();
  });
};
