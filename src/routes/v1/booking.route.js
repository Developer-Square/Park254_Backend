const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { bookingController, bookParkingController } = require('../../controllers');
const { bookingValidation } = require('../../validations');

const router = express.Router();

router
  .route('/')
  .post(auth('manageBookings'), validate(bookingValidation.book), bookParkingController.book)
  .get(auth('getBookings'), validate(bookingValidation.queryBookings), bookingController.getBookings);

router
  .route('/:bookingId')
  .get(auth('getBookings'), validate(bookingValidation.getBookingById), bookingController.getBookingById)
  .patch(auth('manageBookings'), validate(bookingValidation.updateBookingById), bookParkingController.updateBookedParkingLot)
  .delete(auth('manageBookings'), validate(bookingValidation.deleteBookingById), bookingController.deleteBookingById)
  .post(auth('manageBookings'), validate(bookingValidation.cancelBooking), bookParkingController.cancelBooking);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Booking management and retrieval
 */

/**
 * @swagger
 * path:
 *  /bookings:
 *    post:
 *      summary: Create a booking
 *      description: Only users can create bookings.
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
 *                - parkingLotId
 *                - clientId
 *                - entryTime
 *                - exitTime
 *                - spaces
 *              properties:
 *                parkingLotId:
 *                  type: string
 *                clientId:
 *                  type: string
 *                spaces:
 *                  type: number
 *                entryTime:
 *                  type: string
 *                exitTime:
 *                   type: string
 *              example:
 *                parkingLotId: 611cf8a53de8676ccf207659
 *                clientId: 60631415e08d0230f3cc07ea
 *                spaces: 800
 *                entryTime: 2021-08-17T11:48:10.917Z
 *                exitTime: 2021-08-17T13:48:10.917Z
 *      responses:
 *        "201":
 *          description: Created
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Booking'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *
 *    get:
 *      summary: Get all parking bookings
 *      description: All users can retrieve all bookings.
 *      tags: [Bookings]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: query
 *          name: parkingLotId
 *          schema:
 *            type: string
 *          description: parking lot id
 *        - in: query
 *          name: clientId
 *          schema:
 *            type: string
 *          description: client Id
 *        - in: query
 *          name: isCancelled
 *          schema:
 *            type: boolean
 *          description: cancellation status
 *        - in: query
 *          name: sortBy
 *          schema:
 *            type: string
 *          description: sort by query in the form of field:desc/asc (ex. name:asc)
 *        - in: query
 *          name: limit
 *          schema:
 *            type: integer
 *            minimum: 1
 *          default: 10
 *          description: Maximum number of bookings
 *        - in: query
 *          name: page
 *          schema:
 *            type: integer
 *            minimum: 1
 *            default: 1
 *          description: Page number
 *        - in: query
 *          name: populate
 *          schema:
 *            type: string
 *            default: clientId, parkingLotId
 *          description: Population options
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  results:
 *                    type: array
 *                    items:
 *                      $ref: '#/components/schemas/Booking'
 *                  page:
 *                    type: integer
 *                    example: 1
 *                  limit:
 *                    type: integer
 *                    example: 10
 *                  totalPages:
 *                    type: integer
 *                    example: 1
 *                  totalResults:
 *                    type: integer
 *                    example: 1
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * path:
 *  /bookings/{id}:
 *    get:
 *      summary: Get a booking
 *      description: only users can fetch a booking.
 *      tags: [Bookings]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: booking id
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Booking'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *        "404":
 *          $ref: '#/components/responses/NotFound'
 *
 *    patch:
 *      summary: Update booking information
 *      description: Only users can update booking information
 *      tags: [Bookings]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: booking id
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                entryTime:
 *                  type: string
 *                exitTime:
 *                  type: string
 *                spaces:
 *                  type: number
 *                parkingLotId:
 *                  type: string
 *              example:
 *                parkingLotId: 611cf8a53de8676ccf207659
 *                spaces: 800
 *                entryTime: 2021-08-17T11:48:10.917Z
 *                exitTime: 2021-08-17T13:48:10.917Z
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Booking'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *        "404":
 *          $ref: '#/components/responses/NotFound'
 *
 *    delete:
 *      summary: Delete a booking
 *      description: Only users can delete bookings.
 *      tags: [Bookings]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: Booking id
 *      responses:
 *        "200":
 *          description: No content
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *        "404":
 *          $ref: '#/components/responses/NotFound'
 *    post:
 *      summary: Cancel a booking
 *      description: Only users can cancel bookings.
 *      tags: [Bookings]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: Booking id
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Booking'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *
 */
