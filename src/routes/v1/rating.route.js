const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const ratingController = require('../../controllers/rating.controller');
const ratingValidation = require('../../validations/rating.validation');

const router = express.Router();

router
  .route('/')
  .post(auth('manageRatings'), validate(ratingValidation.createRating), ratingController.createRating)
  .get(auth('getRatings'), validate(ratingValidation.queryRatings), ratingController.getRatings);

router
  .route('/:ratingId')
  .get(auth('getRatings'), validate(ratingValidation.getRatingById), ratingController.getRatingById)
  .patch(auth('manageRatings'), validate(ratingValidation.updateRatingById), ratingController.updateRatingById)
  .delete(auth('manageRatings'), validate(ratingValidation.deleteRatingById), ratingController.deleteRatingById);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Ratings
 *   description: Rating management and retrieval
 */

/**
 * @swagger
 * path:
 *  /ratings:
 *    post:
 *      summary: Create a rating
 *      description: All users can create ratings.
 *      tags: [Ratings]
 *      security:
 *        - bearerAuth: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - userId
 *                - parkingLotId
 *                - value
 *              properties:
 *                userId:
 *                  type: string
 *                parkingLotId:
 *                  type: string
 *                value:
 *                  type: number
 *                  enum: [1,2,3,4,5]
 *              example:
 *                userId: 5ebac534954b54139806c115
 *                parkingLotId: 5ebac534954b54139806c116
 *                value: 5
 *      responses:
 *        "201":
 *          description: Created
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Rating'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *
 *    get:
 *      summary: Get all ratings
 *      description: All users can get ratings.
 *      tags: [Ratings]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: query
 *          name: userId
 *          schema:
 *            type: string
 *          description: user Id
 *        - in: query
 *          name: parkingLotId
 *          schema:
 *            type: string
 *          description: parking lot id
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
 *          description: Maximum number of ratings
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
 *                      $ref: '#/components/schemas/Rating'
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
 *  /ratings/{id}:
 *    get:
 *      summary: Get a rating
 *      description: All users can fetch a rating.
 *      tags: [Ratings]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: Rating id
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Rating'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *        "404":
 *          $ref: '#/components/responses/NotFound'
 *
 *    patch:
 *      summary: Update rating information
 *      description: Only users and admins can update rating information
 *      tags: [Ratings]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: Rating id
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                userId:
 *                  type: string
 *                parkingLotId:
 *                  type: string
 *                value:
 *                  type: number
 *                  enum: [1,2,3,4,5]
 *              example:
 *                userId: 5ebac534954b54139806c115
 *                parkingLotId: 5ebac534954b54139806c116
 *                value: 4
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Rating'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *        "404":
 *          $ref: '#/components/responses/NotFound'
 *
 *    delete:
 *      summary: Delete a rating
 *      description: Only admins and users can delete ratings.
 *      tags: [Ratings]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: Rating id
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
