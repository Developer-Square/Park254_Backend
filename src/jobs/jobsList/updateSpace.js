const { getParkingLotById } = require("../../services/parkingLot.service");

module.exports = (agenda) => {
    agenda.define("Update parking lot spaces", async(job, done) => {
        const parkingLotId = job.attrs.data.parkingLotId;
        const spaces = job.attrs.data.spaces;
        const parkingLot = await getParkingLotById(parkingLotId);
        if (!parkingLot) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Parking lot not found');
        }
        parkingLot.spaces = parkingLot.spaces + spaces;
        await parkingLot.save();
        
        done();
    })
}