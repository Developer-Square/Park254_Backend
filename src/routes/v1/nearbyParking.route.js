const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const parkingLotController = require('../../controllers/parkingLot.controller');
const parkingLotValidation = require('../../validations/parkingLot.validation');

const router = express.Router();

router
  .route('/')
  .get(
    auth('getParkingLots'),
    validate(parkingLotValidation.findNearestParkingLot),
    parkingLotController.findNearestParkingLot
  );

module.exports = router;

/**
 * @swagger
 * path:
 *  /nearbyParking:
 *    get:
 *      summary: Get nearby parking lots
 *      description: All users can fetch nearby parking lots.
 *      tags: [ParkingLots]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: query
 *          name: longitude
 *          required: true
 *          schema:
 *            type: number
 *          description: longitude of the user's desired parking location
 *        - in: query
 *          name: latitude
 *          required: true
 *          schema:
 *            type: number
 *          description: latitude of the user's desired parking location
 *        - in: query
 *          name: maxDistance
 *          default: 5
 *          schema:
 *            type: number
 *          description: The maximum distance from the center point that the documents can be
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/NearbyParkingLot'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *        "404":
 *          $ref: '#/components/responses/NotFound'
 */
