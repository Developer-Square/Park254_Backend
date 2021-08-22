const mongoose = require('mongoose');
const request = require('supertest');
const faker = require('faker');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const { ParkingLot } = require('../../src/models');
const { userOne, userTwo, admin, adminTwo, adminThree, insertUsers } = require('../fixtures/user.fixture');
const { parkingLotOne, parkingLotTwo, parkingLotThree, insertParkingLots } = require('../fixtures/parkingLot.fixture');
const { userOneAccessToken, adminAccessToken, adminThreeAccessToken } = require('../fixtures/token.fixture');

setupTestDB();

describe('Parking lot routes', () => {
  describe('POST /v1/parkingLots', () => {
    let newParkingLot;

    beforeEach(async () => {
      newParkingLot = {
        name: faker.lorem.sentence(5),
        spaces: 50,
        images: [faker.internet.url(), faker.internet.url(), faker.internet.url()],
        location: { type: 'Point', coordinates: [36.8257173099633, -1.2891936094897558] },
        owner: admin._id,
        price: 200,
        address: 'Tom Mboya Street',
      };
    });

    test('should return 201 and successfully create new parking lot if data is ok', async () => {
      await insertUsers([admin]);

      const res = await request(app)
        .post('/v1/parkingLots')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newParkingLot)
        .expect(httpStatus.CREATED);

      expect(res.body.name).toBe(newParkingLot.name);
      expect(res.body.price).toBe(newParkingLot.price);
      expect(res.body.address).toBe(newParkingLot.address);
      expect(res.body.city).toBe('Nairobi');

      const dbParkingLot = await ParkingLot.findById(res.body.id);

      expect(dbParkingLot).toBeDefined();
      expect(dbParkingLot.name).toBe(newParkingLot.name);
      expect(dbParkingLot.spaces).toBe(newParkingLot.spaces);
      expect(dbParkingLot.ratingCount).toBe(0);
      expect(dbParkingLot.ratingValue).toBe(0);
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).post('/v1/parkingLots').send(newParkingLot).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 error if logged in user is not admin', async () => {
      await insertUsers([userOne]);

      await request(app)
        .post('/v1/parkingLots')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newParkingLot)
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 400 error if owner is not a valid mongo id', async () => {
      await insertUsers([admin]);
      newParkingLot.owner = 'invalidOwner';

      await request(app)
        .post('/v1/parkingLots')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newParkingLot)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if spaces is less than 1', async () => {
      await insertUsers([admin]);
      newParkingLot.spaces = 0;

      await request(app)
        .post('/v1/parkingLots')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newParkingLot)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if location is not of type "Point"', async () => {
      await insertUsers([admin]);
      newParkingLot.location.type = 'invalidType';

      await request(app)
        .post('/v1/parkingLots')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newParkingLot)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if owner does not exist', async () => {
      await insertUsers([admin]);
      newParkingLot.owner = adminTwo._id;

      await request(app)
        .post('/v1/parkingLots')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newParkingLot)
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 400 error if name is already taken', async () => {
      await insertUsers([admin]);
      await insertParkingLots([parkingLotOne]);
      newParkingLot.name = parkingLotOne.name;

      await request(app)
        .post('/v1/parkingLots')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newParkingLot)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('GET /v1/parkingLots', () => {
    test('should return 200 and apply the default query options', async () => {
      await insertUsers([admin, adminTwo]);
      await insertParkingLots([parkingLotOne, parkingLotTwo, parkingLotThree]);

      const res = await request(app)
        .get('/v1/parkingLots')
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
      expect(res.body.results[0].id).toBe(parkingLotOne._id);
    });

    test('should return 401 if access token is missing', async () => {
      await insertParkingLots([parkingLotOne, parkingLotTwo, parkingLotThree]);

      await request(app).get('/v1/parkingLots').send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 200 if a non-admin is trying to access all parking lots', async () => {
      await insertUsers([userOne, admin, adminTwo]);
      await insertParkingLots([parkingLotOne, parkingLotTwo, parkingLotThree]);

      await request(app)
        .get('/v1/parkingLots')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);
    });

    test('should correctly apply filter on name field', async () => {
      await insertUsers([admin, adminTwo]);
      await insertParkingLots([parkingLotOne, parkingLotTwo, parkingLotThree]);

      const res = await request(app)
        .get('/v1/parkingLots')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ name: parkingLotOne.name })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 1,
      });
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0].id).toBe(parkingLotOne._id);
    });

    test('should correctly apply filter on owner field', async () => {
      await insertUsers([admin, adminTwo]);
      await insertParkingLots([parkingLotOne, parkingLotTwo, parkingLotThree]);

      const res = await request(app)
        .get('/v1/parkingLots')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ owner: admin._id })
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
      expect(res.body.results[0].id).toBe(parkingLotOne._id);
      expect(res.body.results[1].id).toBe(parkingLotTwo._id.toHexString());
    });

    test('should correctly sort the returned array if descending sort param is specified', async () => {
      await insertUsers([admin, adminTwo]);
      await insertParkingLots([parkingLotOne, parkingLotTwo, parkingLotThree]);

      const res = await request(app)
        .get('/v1/parkingLots')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ sortBy: 'spaces:desc' })
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
      expect(res.body.results[0].id).toBe(parkingLotOne._id);
      expect(res.body.results[1].id).toBe(parkingLotTwo._id.toHexString());
      expect(res.body.results[2].id).toBe(parkingLotThree._id.toHexString());
    });

    test('should correctly sort the returned array if ascending sort param is specified', async () => {
      await insertUsers([admin, adminTwo]);
      await insertParkingLots([parkingLotOne, parkingLotTwo, parkingLotThree]);

      const res = await request(app)
        .get('/v1/parkingLots')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ sortBy: 'spaces:asc' })
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
      expect(res.body.results[0].id).toBe(parkingLotThree._id.toHexString());
      expect(res.body.results[1].id).toBe(parkingLotTwo._id.toHexString());
      expect(res.body.results[2].id).toBe(parkingLotOne._id);
    });

    test('should limit returned array if limit param is specified', async () => {
      await insertUsers([admin, adminTwo]);
      await insertParkingLots([parkingLotOne, parkingLotTwo, parkingLotThree]);

      const res = await request(app)
        .get('/v1/parkingLots')
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
      expect(res.body.results[0].id).toBe(parkingLotOne._id);
      expect(res.body.results[1].id).toBe(parkingLotTwo._id.toHexString());
    });

    test('should return the correct page if page and limit params are specified', async () => {
      await insertUsers([admin, adminTwo]);
      await insertParkingLots([parkingLotOne, parkingLotTwo, parkingLotThree]);

      const res = await request(app)
        .get('/v1/parkingLots')
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
      expect(res.body.results[0].id).toBe(parkingLotThree._id.toHexString());
    });
  });

  describe('GET /v1/parkingLots/:parkingLotId', () => {
    test('should return 200 and the parking lot object if data is ok', async () => {
      await insertUsers([admin, adminTwo]);
      await insertParkingLots([parkingLotOne, parkingLotTwo, parkingLotThree]);

      const res = await request(app)
        .get(`/v1/parkingLots/${parkingLotOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body.name).toBe(parkingLotOne.name);
      expect(res.body.spaces).toBe(parkingLotOne.spaces);
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([admin, adminTwo]);
      await insertParkingLots([parkingLotOne, parkingLotTwo, parkingLotThree]);

      await request(app).get(`/v1/parkingLots/${parkingLotOne._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 200 if non-admin is trying to get parking lot', async () => {
      await insertUsers([userOne, adminTwo, admin]);
      await insertParkingLots([parkingLotOne, parkingLotTwo, parkingLotThree]);

      await request(app)
        .get(`/v1/parkingLots/${parkingLotTwo._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);
    });

    test('should return 200 and the parking lot object if admin is trying to get parking lot', async () => {
      await insertUsers([admin, adminTwo, adminThree]);
      await insertParkingLots([parkingLotOne, parkingLotTwo, parkingLotThree]);

      await request(app)
        .get(`/v1/parkingLots/${parkingLotOne._id}`)
        .set('Authorization', `Bearer ${adminThreeAccessToken}`)
        .send()
        .expect(httpStatus.OK);
    });

    test('should return 400 error if parkingLotId is not a valid mongo id', async () => {
      await insertUsers([admin]);
      await insertParkingLots([parkingLotOne]);

      await request(app)
        .get('/v1/parkingLots/invalidId')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if parking lot is not found', async () => {
      await insertUsers([admin]);
      await insertParkingLots([parkingLotTwo]);

      await request(app)
        .get(`/v1/parkingLots/${parkingLotOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /v1/parkingLots/:parkingLotId', () => {
    test('should return 204 if data is ok', async () => {
      await insertUsers([admin]);
      await insertParkingLots([parkingLotOne]);

      await request(app)
        .delete(`/v1/parkingLots/${parkingLotOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbParkingLot = await ParkingLot.findById(parkingLotOne._id);
      expect(dbParkingLot).toBeNull();
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([admin]);
      await insertParkingLots([parkingLotOne]);

      await request(app).delete(`/v1/parkingLots/${parkingLotOne._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 error if unauthorized user is trying to delete parking slot', async () => {
      await insertUsers([userOne, userTwo, admin]);
      await insertParkingLots([parkingLotOne]);

      await request(app)
        .delete(`/v1/parkingLots/${parkingLotOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 204 if admin is trying to delete another user"s parking lot', async () => {
      await insertUsers([admin]);
      await insertParkingLots([parkingLotThree]);

      await request(app)
        .delete(`/v1/parkingLots/${parkingLotThree._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);
    });

    test('should return 400 error if parkingLotId is not a valid mongo id', async () => {
      await insertUsers([admin]);
      await insertParkingLots([parkingLotOne]);

      await request(app)
        .delete('/v1/parkingLots/invalidId')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if parking lot is not found', async () => {
      await insertUsers([admin]);
      await insertParkingLots([parkingLotTwo]);

      await request(app)
        .delete(`/v1/parkingLots/${parkingLotOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /v1/parkingLots/:parkingLotId', () => {
    test('should return 200 and successfully update parking lot if data is ok', async () => {
      await insertUsers([admin, adminThree]);
      await insertParkingLots([parkingLotOne]);
      const updateBody = {
        name: faker.lorem.sentence(5),
        spaces: faker.random.number({ min: 1 }),
        owner: adminThree._id,
      };

      const res = await request(app)
        .patch(`/v1/parkingLots/${parkingLotOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      expect(res.body.name).toBe(updateBody.name);
      expect(res.body.spaces).toBe(updateBody.spaces);

      const dbParkingLot = await ParkingLot.findById(parkingLotOne._id);
      expect(dbParkingLot).toBeDefined();
      expect(dbParkingLot.name).toBe(updateBody.name);
      expect(dbParkingLot.spaces).toBe(updateBody.spaces);
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([admin, adminThree]);
      await insertParkingLots([parkingLotOne]);
      const updateBody = { name: faker.lorem.sentence(5) };

      await request(app).patch(`/v1/parkingLots/${parkingLotOne._id}`).send(updateBody).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 if unauthorized user is updating parking lot', async () => {
      await insertUsers([userOne, admin]);
      await insertParkingLots([parkingLotOne]);
      const updateBody = { name: faker.lorem.sentence(5) };

      await request(app)
        .patch(`/v1/parkingLots/${parkingLotOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 200 and successfully update user if admin is updating another user"s parking lot', async () => {
      await insertUsers([userOne, admin, adminThree]);
      await insertParkingLots([parkingLotOne]);
      const updateBody = { name: faker.lorem.sentence(5) };

      await request(app)
        .patch(`/v1/parkingLots/${parkingLotOne._id}`)
        .set('Authorization', `Bearer ${adminThreeAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);
    });

    test('should return 404 if parking lot is not found', async () => {
      await insertUsers([admin]);
      await insertParkingLots([parkingLotOne]);
      const updateBody = { name: faker.lorem.sentence(5) };

      await request(app)
        .patch(`/v1/parkingLots/${parkingLotTwo._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 404 if owner is not found', async () => {
      await insertUsers([admin]);
      await insertParkingLots([parkingLotOne]);
      const updateBody = { owner: mongoose.Types.ObjectId() };

      await request(app)
        .patch(`/v1/parkingLots/${parkingLotOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 400 error if parkingLotId is not a valid mongo id', async () => {
      await insertUsers([admin]);
      await insertParkingLots([parkingLotOne]);
      const updateBody = { name: faker.lorem.sentence(5) };

      await request(app)
        .patch(`/v1/parkingLots/invalidId`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if owner is not a valid mongo id', async () => {
      await insertUsers([admin]);
      await insertParkingLots([parkingLotOne]);
      const updateBody = { owner: 'invalidOwner' };

      await request(app)
        .patch(`/v1/parkingLots/${parkingLotOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if spaces is less than 1', async () => {
      await insertUsers([admin]);
      await insertParkingLots([parkingLotOne]);
      const updateBody = { spaces: 0 };

      await request(app)
        .patch(`/v1/parkingLots/${parkingLotOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if name is already taken', async () => {
      await insertUsers([admin]);
      await insertParkingLots([parkingLotOne, parkingLotTwo]);
      const updateBody = { name: parkingLotOne.name };

      await request(app)
        .patch(`/v1/parkingLots/${parkingLotTwo._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });
  });
});
