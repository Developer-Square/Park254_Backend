const { db } = require("../models/token.model");

db.parkinglots.aggregate([
    {
        $geoNear: {
            near: { type: "Point", coordinates: [ 36.82090399065296 , -1.2862659934908445 ] },
            key: "location",
            distanceField: "dist.calculated",
            maxDistance: 5000,
            includeLocs: "dist.location",
            spherical: true,
        }
    }
]).pretty()
