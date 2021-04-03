const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const parkingLotController = require('../../controllers/parkingLot.controller');
const parkingLotValidation = require('../../validations/parkingLot.validation');

const router = express.Router();

router
  .route('/')
  .post(auth('manageParkingLots'), validate(parkingLotValidation.createParkingLot), parkingLotController.createParkingLot)
  .get(auth('getParkingLots'), validate(parkingLotValidation.queryParkingLots), parkingLotController.getParkingLots);

router
  .route('/:parkingLotId')
  .get(auth('getParkingLots'), validate(parkingLotValidation.getParkingLotById), parkingLotController.getParkingLotById)
  .patch(auth('manageParkingLots'), validate(parkingLotValidation.updateParkingLotById), parkingLotController.updateParkingLotById)
  .delete(auth('manageParkingLots'), validate(parkingLotValidation.deleteParkingLotById), parkingLotController.deleteParkingLotById);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: ParkingLots
 *   description: Parking lot management and retrieval
 */

/**
 * @swagger
 * path:
 *  /parkingLots:
 *    post:
 *      summary: Create a parking lot
 *      description: Only vendors can create parking lots.
 *      tags: [ParkingLots]
 *      security:
 *        - bearerAuth: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - name
 *                - owner
 *                - spaces
 *                - location
 *                - images
 *              properties:
 *                name:
 *                  type: string
 *                owner:
 *                  type: string
 *                spaces:
 *                  type: number
 *                location:
 *                  type: object
 *                images:
 *                   type: array
 *              example:
 *                name: Holy Basilica Parking
 *                owner: 5ebac534954b54139806c112
 *                spaces: 800
 *                location: { type: "Point", coordinates: [ -73.98142 , 40.71782 ] }
 *                images: ["https://imageone.com", "https://imagetwo.com", "https://imagethree.com"]
 *      responses:
 *        "201":
 *          description: Created
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/ParkingLot'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *
 *    get:
 *      summary: Get all parking lots
 *      description: Only admins and vendors can retrieve all parking lots.
 *      tags: [ParkingLots]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: query
 *          name: name
 *          schema:
 *            type: string
 *          description: Parking lot name
 *        - in: query
 *          name: owner
 *          schema:
 *            type: string
 *          description: Parking lot owner
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
 *          description: Maximum number of parking lots
 *        - in: query
 *          name: page
 *          schema:
 *            type: integer
 *            minimum: 1
 *            default: 1
 *          description: Page number
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
 *                      $ref: '#/components/schemas/ParkingLot'
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
 *  /parkingLots/{id}:
 *    get:
 *      summary: Get a parking lot
 *      description: All users can fetch a parking lot.
 *      tags: [ParkingLots]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: Parking lot id
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/ParkingLot'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *        "404":
 *          $ref: '#/components/responses/NotFound'
 *
 *    patch:
 *      summary: Update parking lot information
 *      description: Only vendors and admins can update parking lot information
 *      tags: [ParkingLots]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: Parking lot id
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                name:
 *                  type: string
 *                owner:
 *                  type: string
 *                spaces:
 *                  type: number
 *                location:
 *                  type: object
 *                images:
 *                   type: array
 *              example:
 *                name: Holy Basilica Parking
 *                owner: 5ebac534954b54139806c112
 *                spaces: 800
 *                location: { type: "Point", coordinates: [ -73.98142 , 40.71782 ] }
 *                images: ["https://imageone.com", "https://imagetwo.com", "https://imagethree.com"]
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/ParkingLot'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *        "404":
 *          $ref: '#/components/responses/NotFound'
 *
 *    delete:
 *      summary: Delete a parking lot
 *      description: Only admins and vendors can delete parking lots.
 *      tags: [ParkingLots]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: Parking lot id
 *      responses:
 *        "200":
 *          description: No content
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *        "404":
 *          $ref: '#/components/responses/NotFound'
 */
