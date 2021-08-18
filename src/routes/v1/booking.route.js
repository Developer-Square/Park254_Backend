const express = require('express');
const { bookingController, bookParkingController } = require('../../controllers');

const router = express.Router();

router.route('/').post(bookParkingController.book).get(bookingController.getBookings);

router
  .route('/:bookingId')
  .get(bookingController.getBookingById)
  .patch(bookParkingController.updateBookedParkingLot)
  .delete(bookingController.deleteBookingById)
  .post(bookParkingController.cancelBooking);

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
 *            default: owner
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
