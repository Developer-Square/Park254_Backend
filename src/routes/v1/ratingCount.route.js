const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const ratingController = require('../../controllers/rating.controller');
const ratingValidation = require('../../validations/rating.validation');

const router = express.Router();

router.route('/').get(auth('getRatings'), validate(ratingValidation.getRatingCounts), ratingController.getRatingCounts);

module.exports = router;

/**
 * @swagger
 * path:
 *  /ratingCount:
 *    get:
 *      summary: Get rating counts
 *      description: All users can get rating counts.
 *      tags: [Ratings]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: query
 *          name: parkingLotId
 *          schema:
 *            type: string
 *          description: parking lot id
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/RatingCount'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 */
