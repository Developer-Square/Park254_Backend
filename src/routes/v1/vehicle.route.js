const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { vehicleValidation } = require('../../validations');
const { vehicleController } = require('../../controllers');

const router = express.Router();

router
  .route('/')
  .post(auth('manageVehicles'), validate(vehicleValidation.createVehicle), vehicleController.createVehicle)
  .get(auth('getVehicles'), validate(vehicleValidation.getVehicles), vehicleController.getVehicles);

router
  .route('/:vehicleId')
  .get(auth('getVehicles'), validate(vehicleValidation.getVehicle), vehicleController.getVehicle)
  .patch(auth('manageVehicles'), validate(vehicleValidation.updateVehicle), vehicleController.updateVehicle)
  .delete(auth('manageVehicles'), validate(vehicleValidation.deleteVehicle), vehicleController.deleteVehicle);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Vehicles
 *   description: vehicles management and retrieval
 */

/**
 * @swagger
 * path:
 *  /vehicles:
 *    post:
 *      summary: Create a vehicle
 *      description: All users can create vehicles.
 *      tags: [Vehicles]
 *      security:
 *        - bearerAuth: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - plate
 *                - model
 *                - owner
 *              properties:
 *                plate:
 *                  type: string
 *                  description: must be unique
 *                model:
 *                  type: string
 *                owner:
 *                  type: string
 *                  description: owner of the vehicle
 *              example:
 *                plate: KAW 674M
 *                model: Nissan B15
 *                owner: 60631415e08d0230f3cc07ea
 *      responses:
 *        "201":
 *          description: Created
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Vehicle'
 *        "400":
 *          $ref: '#/components/responses/DuplicatePlate'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *
 *    get:
 *      summary: Get all vehicles
 *      description: All users can retrieve vehicles.
 *      tags: [Vehicles]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: query
 *          name: plate
 *          schema:
 *            type: string
 *          description: Vehicle number plate
 *        - in: query
 *          name: owner
 *          schema:
 *            type: string
 *          description: Owner of the vehicle
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
 *          description: Maximum number of vehicles
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
 *                      $ref: '#/components/schemas/Vehicle'
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
 *  /vehicles/{id}:
 *    get:
 *      summary: Get a vehicle
 *      description: All users can get a vehicle.
 *      tags: [Vehicles]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: Vehicle id
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Vehicle'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *        "404":
 *          $ref: '#/components/responses/NotFound'
 *
 *    patch:
 *      summary: Update a vehicle
 *      description: Users can only update their vehicles. Only admins can update the vehicles of other users
 *      tags: [Vehicles]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: Vehicle id
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                plate:
 *                  type: string
 *                  description: must be unique
 *                model:
 *                  type: string
 *                owner:
 *                  type: string
 *              example:
 *                plate: KDA 782D
 *                model: Nissan Note
 *                owner: 60631415e08d0230f3cc07ea
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Vehicle'
 *        "400":
 *          $ref: '#/components/responses/DuplicatePlate'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *        "404":
 *          $ref: '#/components/responses/NotFound'
 *
 *    delete:
 *      summary: Delete a vehicle
 *      description: Logged in users can delete only their vehicles. Only admins can delete other users' vehicles.
 *      tags: [Vehicles]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: Vehicle id
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
