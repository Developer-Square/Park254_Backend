const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { bookParkingController } = require('../../controllers');
const { bookingValidation } = require('../../validations');

const router = express.Router();

router
  .route('/')
  .post(auth('book'), validate(bookingValidation.findAvailableSpaces), bookParkingController.findAvailableSpaces);

module.exports = router;

/**
 * @swagger
 * path:
 *  /spaces:
 *    post:
 *      summary: Check for available parking spaces
 *      description: All users can check for parking spaces
 *      tags: [Bookings]
 *      security:
 *        - bearerAuth: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - parkingLots
 *                - entryTime
 *                - exitTime
 *              properties:
 *                parkingLots:
 *                  type: array
 *                entryTime:
 *                  type: string
 *                exitTime:
 *                  type: string
 *              example:
 *                parkingLots: ["611cf8a53de8676ccf207659", "610a429e97da81392b9b4473"]
 *                entryTime: 2021-08-17T08:20:55.043Z
 *                exitTime: 2021-08-17T08:20:55.043Z
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/SpaceDetails'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 */
