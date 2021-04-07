const request = require('supertest');
const faker = require('faker');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const { ParkingLot, Rating } = require('../../src/models');
const { ratingOne, ratingTwo, ratingThree, insertRatings } = require('../fixtures/rating.fixture');
const { userOne, admin, adminTwo, adminThree, insertUsers, vendor } = require('../fixtures/user.fixture');
const { parkingLotOne, parkingLotTwo, parkingLotThree, insertParkingLots } = require('../fixtures/parkingLot.fixture');
const { userOneAccessToken, adminAccessToken, adminThreeAccessToken, vendorAccessToken } = require('../fixtures/token.fixture');

setupTestDB();

describe('Rating routes', () => {
  describe('POST /v1/ratings', () => {
    let newRating;

    beforeEach(async () => {
      newRating = {
        userId: admin._id,
        parkingLotId: parkingLotOne._id,
        value: faker.random.number({ min: 1, max: 5 }),
      };
      await insertUsers([admin]);
      await insertParkingLots([parkingLotOne, parkingLotThree]);
    });

    test('should return 201 and successfully create new rating if data is ok', async () => {
      const res = await request(app)
        .post('/v1/ratings')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newRating)
        .expect(httpStatus.CREATED);

      expect(res.body.userId).toBe(newRating.userId);
      expect(res.body.parkingLotId).toBe(newRating.parkingLotId);
      expect(res.body.value).toBe(newRating.value);

      const dbRating = await Rating.findById(res.body.id);

      expect(dbRating).toBeDefined();
      expect(dbRating.userId).toBe(newRating.userId);
      expect(dbRating.parkingLotId).toBe(newRating.parkingLotId);
      expect(dbRating.value).toBe(newRating.value);
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).post('/v1/ratings').send(newRating).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 201 if logged in user is not admin', async () => {
      await insertUsers([userOne]);

      await request(app)
        .post('/v1/ratings')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newRating)
        .expect(httpStatus.CREATED);
    });

    test('should return 403 error if logged in user is vendor', async () => {
      await insertUsers([vendor]);

      await request(app)
        .post('/v1/ratings')
        .set('Authorization', `Bearer ${vendorAccessToken}`)
        .send(newRating)
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 400 error if userId is not a valid mongo id', async () => {
      newRating.userId = 'invalidUser';

      await request(app)
        .post('/v1/ratings')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newRating)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if parkingLotId is not a valid mongo id', async () => {
      newRating.parkingLotId = 'invalidParkingLot';

      await request(app)
        .post('/v1/ratings')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newRating)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if value is less than 1', async () => {
      newRating.value = 0;

      await request(app)
        .post('/v1/ratings')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newRating)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if value is more than 5', async () => {
      newRating.value = 6;

      await request(app)
        .post('/v1/ratings')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newRating)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if user does not exist', async () => {
      newRating.userId = adminTwo._id;

      await request(app)
        .post('/v1/ratings')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newRating)
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 404 error if parking lot does not exist', async () => {
      newRating.parkingLotId = parkingLotTwo._id;

      await request(app)
        .post('/v1/ratings')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newRating)
        .expect(httpStatus.NOT_FOUND);
    });

    test('should increment the ratingCount and ratingValue of parking lot if its a user"s first rating', async () => {
      const beforeParkingLot = await ParkingLot.findById(newRating.parkingLotId);

      const res = await request(app)
        .post('/v1/ratings')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newRating)
        .expect(httpStatus.CREATED);

      const afterParkingLot = await ParkingLot.findById(res.body.parkingLotId);
      expect(afterParkingLot.ratingCount - beforeParkingLot.ratingCount).toBe(1);
      expect(afterParkingLot.ratingValue - beforeParkingLot.ratingValue).toBe(newRating.value);
    });

    test('should replace the ratingCount and ratingValue of parking lot if its not a user"s first rating', async () => {
      await insertRatings([ratingOne]);
      const beforeParkingLot = await ParkingLot.findById(newRating.parkingLotId);
      const query = { userId: newRating.userId, parkingLotId: newRating.parkingLotId };
      const previousRating = await Rating.findOne(query);

      const res = await request(app)
        .post('/v1/ratings')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newRating)
        .expect(httpStatus.CREATED);

      const afterParkingLot = await ParkingLot.findById(res.body.parkingLotId);
      expect(afterParkingLot.ratingCount - beforeParkingLot.ratingCount).toBe(0);
      expect(afterParkingLot.ratingValue - beforeParkingLot.ratingValue).toBe(newRating.value - previousRating.value);
    });
  });

  describe('GET /v1/ratings', () => {
    beforeEach(async () => {
      await insertUsers([admin, adminThree]);
      await insertParkingLots([parkingLotOne, parkingLotTwo]);
    });

    test('should return 200 and apply the default query options', async () => {
      await insertRatings([ratingOne, ratingTwo, ratingThree]);

      const res = await request(app)
        .get('/v1/ratings')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 3,
      });
      expect(res.body.results).toHaveLength(3);
      expect(res.body.results[0].id).toBe(ratingOne._id.toHexString());
    });

    test('should return 401 if access token is missing', async () => {
      await insertRatings([ratingOne, ratingTwo, ratingThree]);

      await request(app).get('/v1/ratings').send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 200 if a non-admin is trying to access all ratings', async () => {
      await insertRatings([ratingOne, ratingTwo, ratingThree]);
      await insertUsers([userOne]);

      await request(app)
        .get('/v1/ratings')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);
    });

    test('should correctly apply filter on userId field', async () => {
      await insertRatings([ratingOne, ratingTwo, ratingThree]);

      const res = await request(app)
        .get('/v1/ratings')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ userId: admin._id })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(2);
      expect(res.body.results[0].id).toBe(ratingOne._id.toHexString());
      expect(res.body.results[1].id).toBe(ratingTwo._id.toHexString());
    });

    test('should correctly apply filter on parkingLotId field', async () => {
      await insertRatings([ratingOne, ratingTwo, ratingThree]);

      const res = await request(app)
        .get('/v1/ratings')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ parkingLotId: parkingLotOne._id })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(2);
      expect(res.body.results[0].id).toBe(ratingOne._id.toHexString());
      expect(res.body.results[1].id).toBe(ratingTwo._id.toHexString());
    });

    test('should correctly sort the returned array if descending sort param is specified', async () => {
      await insertRatings([ratingOne, ratingTwo, ratingThree]);

      const res = await request(app)
        .get('/v1/ratings')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ sortBy: 'value:desc' })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 3,
      });
      expect(res.body.results).toHaveLength(3);
      expect(res.body.results[0].id).toBe(ratingThree._id.toHexString());
      expect(res.body.results[1].id).toBe(ratingTwo._id.toHexString());
      expect(res.body.results[2].id).toBe(ratingOne._id.toHexString());
    });

    test('should correctly sort the returned array if ascending sort param is specified', async () => {
      await insertRatings([ratingOne, ratingTwo, ratingThree]);

      const res = await request(app)
        .get('/v1/ratings')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ sortBy: 'value:asc' })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 3,
      });
      expect(res.body.results).toHaveLength(3);
      expect(res.body.results[0].id).toBe(ratingOne._id.toHexString());
      expect(res.body.results[1].id).toBe(ratingTwo._id.toHexString());
      expect(res.body.results[2].id).toBe(ratingThree._id.toHexString());
    });

    test('should limit returned array if limit param is specified', async () => {
      await insertRatings([ratingOne, ratingTwo, ratingThree]);

      const res = await request(app)
        .get('/v1/ratings')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ limit: 2 })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 2,
        totalPages: 2,
        totalResults: 3,
      });
      expect(res.body.results).toHaveLength(2);
      expect(res.body.results[0].id).toBe(ratingOne._id.toHexString());
      expect(res.body.results[1].id).toBe(ratingTwo._id.toHexString());
    });

    test('should return the correct page if page and limit params are specified', async () => {
      await insertRatings([ratingOne, ratingTwo, ratingThree]);

      const res = await request(app)
        .get('/v1/ratings')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ page: 2, limit: 2 })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 2,
        limit: 2,
        totalPages: 2,
        totalResults: 3,
      });
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0].id).toBe(ratingThree._id.toHexString());
    });
  });

  describe('GET /v1/ratings/:ratingId', () => {
    beforeEach(async () => {
      await insertUsers([admin, adminThree]);
      await insertParkingLots([parkingLotOne, parkingLotTwo]);
    });

    test('should return 200 and the rating object if data is ok', async () => {
      await insertRatings([ratingOne, ratingTwo, ratingThree]);

      const res = await request(app)
        .get(`/v1/ratings/${ratingOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body.userId).toBe(ratingOne.userId);
      expect(res.body.parkingLotId).toBe(ratingOne.parkingLotId);
      expect(res.body.value).toBe(ratingOne.value);
    });

    test('should return 401 error if access token is missing', async () => {
      await insertRatings([ratingOne, ratingTwo, ratingThree]);

      await request(app).get(`/v1/ratings/${ratingOne._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 200 if non-admin is trying to get rating', async () => {
      await insertUsers([userOne]);
      await insertRatings([ratingOne, ratingTwo, ratingThree]);

      await request(app)
        .get(`/v1/ratings/${ratingOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);
    });

    test('should return 200 and the rating object if admin is trying to get the rating', async () => {
      await insertRatings([ratingOne, ratingTwo, ratingThree]);

      await request(app)
        .get(`/v1/ratings/${ratingOne._id}`)
        .set('Authorization', `Bearer ${adminThreeAccessToken}`)
        .send()
        .expect(httpStatus.OK);
    });

    test('should return 400 error if ratingId is not a valid mongo id', async () => {
      await insertRatings([ratingOne, ratingTwo, ratingThree]);

      await request(app)
        .get('/v1/ratings/invalidId')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if rating is not found', async () => {
      await insertRatings([ratingTwo, ratingThree]);

      await request(app)
        .get(`/v1/ratings/${ratingOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /v1/ratings/:ratingId', () => {
    beforeEach(async () => {
      await insertUsers([admin, adminThree]);
      await insertParkingLots([parkingLotOne, parkingLotTwo]);
    });

    test('should return 204 if data is ok', async () => {
      await insertRatings([ratingOne, ratingTwo, ratingThree]);

      await request(app)
        .delete(`/v1/ratings/${ratingOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbRating = await Rating.findById(ratingOne._id);
      expect(dbRating).toBeNull();
    });

    test('should return 401 error if access token is missing', async () => {
      await insertRatings([ratingOne, ratingTwo, ratingThree]);

      await request(app).delete(`/v1/ratings/${ratingOne._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 error if unauthorized user is trying to delete rating', async () => {
      await insertRatings([ratingOne, ratingTwo, ratingThree]);
      await insertUsers([userOne]);

      await request(app)
        .delete(`/v1/ratings/${ratingOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 204 if admin is trying to delete another user"s rating', async () => {
      await insertRatings([ratingOne, ratingTwo, ratingThree]);

      await request(app)
        .delete(`/v1/ratings/${ratingThree._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);
    });

    test('should return 400 error if ratingId is not a valid mongo id', async () => {
      await insertRatings([ratingOne, ratingTwo, ratingThree]);

      await request(app)
        .delete('/v1/ratings/invalidId')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if rating is not found', async () => {
      await insertRatings([ratingTwo, ratingThree]);

      await request(app)
        .delete(`/v1/ratings/${ratingOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });
});
