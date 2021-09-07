const request = require('supertest');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const { Vehicle } = require('../../src/models');
const { userOne, admin, adminThree, insertUsers, userTwo } = require('../fixtures/user.fixture');
const { userOneAccessToken, adminAccessToken, adminThreeAccessToken } = require('../fixtures/token.fixture');
const { vehicleOne, vehicleTwo, vehicleThree, insertVehicles } = require('../fixtures/vehicle.fixture');

setupTestDB();

describe('Vehicle routes', () => {
  describe('POST /v1/vehicles', () => {
    let newVehicle;

    beforeEach(async () => {
      newVehicle = {
        owner: userOne._id,
        model: 'Jaguar iPace',
        plate: 'KDD 999Y',
      };
      await insertUsers([userOne, admin]);
    });

    test('should return 201 and successfully create new vehicle if data is ok', async () => {
      const res = await request(app)
        .post('/v1/vehicles')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newVehicle)
        .expect(httpStatus.CREATED);

      expect(res.body).toEqual({
        id: expect.anything(),
        owner: newVehicle.owner.toHexString(),
        model: newVehicle.model,
        plate: newVehicle.plate,
      });

      const dbVehicle = await Vehicle.findById(res.body.id);

      expect(dbVehicle).toBeDefined();
      expect(dbVehicle).toMatchObject({ owner: newVehicle.owner, model: newVehicle.model, plate: newVehicle.plate });
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).post('/v1/vehicles').send(newVehicle).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 201 if logged in user is admin', async () => {
      await request(app)
        .post('/v1/vehicles')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newVehicle)
        .expect(httpStatus.CREATED);
    });

    test('should return 201 if plate is lowercase and return uppercase plate', async () => {
      newVehicle.plate = 'kdd 275j';

      const res = await request(app)
        .post('/v1/vehicles')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newVehicle)
        .expect(httpStatus.CREATED);

      expect(res.body.plate).toBe(newVehicle.plate.toUpperCase());
    });

    test('should return 400 error if owner is not a valid mongo id', async () => {
      newVehicle.owner = 'invalidOwner';

      await request(app)
        .post('/v1/vehicles')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newVehicle)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if number plate is taken', async () => {
      await insertVehicles([vehicleOne]);
      newVehicle.plate = vehicleOne.plate;

      await request(app)
        .post('/v1/vehicles')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newVehicle)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if owner does not exist', async () => {
      newVehicle.owner = adminThree._id;

      await request(app)
        .post('/v1/vehicles')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newVehicle)
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 403 error if owner is not admin and tries to create vehicle for another user', async () => {
      newVehicle.owner = admin._id;

      await request(app)
        .post('/v1/vehicles')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newVehicle)
        .expect(httpStatus.FORBIDDEN);
    });
  });

  describe('GET /v1/vehicles', () => {
    beforeEach(async () => {
      await insertUsers([admin, userOne]);
      await insertVehicles([vehicleOne, vehicleTwo, vehicleThree]);
    });
    test('should return 200 and apply the default query options', async () => {
      const res = await request(app)
        .get('/v1/vehicles')
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
      expect(res.body.results[0].id).toBe(vehicleOne._id.toHexString());
    });

    test('should return 401 if access token is missing', async () => {
      await request(app).get('/v1/vehicles').send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 200 if a non-admin is trying to access all bookings', async () => {
      await request(app)
        .get('/v1/vehicles')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);
    });

    test('should correctly apply filter on owner field', async () => {
      const res = await request(app)
        .get('/v1/vehicles')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ owner: userOne._id.toHexString() })
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
      expect(res.body.results[0].id).toBe(vehicleOne._id.toHexString());
      expect(res.body.results[1].id).toBe(vehicleTwo._id.toHexString());
    });

    test('should correctly apply filter on plate field', async () => {
      const res = await request(app)
        .get('/v1/vehicles')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ plate: vehicleOne.plate })
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
      expect(res.body.results[0].id).toBe(vehicleOne._id.toHexString());
    });

    test('should correctly sort the returned array if descending sort param is specified', async () => {
      const res = await request(app)
        .get('/v1/vehicles')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ sortBy: '_id:desc' })
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
      expect(res.body.results[0].id).toBe(vehicleThree._id.toHexString());
      expect(res.body.results[1].id).toBe(vehicleTwo._id.toHexString());
      expect(res.body.results[2].id).toBe(vehicleOne._id.toHexString());
    });

    test('should correctly sort the returned array if ascending sort param is specified', async () => {
      const res = await request(app)
        .get('/v1/vehicles')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ sortBy: '_id:asc' })
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
      expect(res.body.results[0].id).toBe(vehicleOne._id.toHexString());
      expect(res.body.results[1].id).toBe(vehicleTwo._id.toHexString());
      expect(res.body.results[2].id).toBe(vehicleThree._id.toHexString());
    });

    test('should limit returned array if limit param is specified', async () => {
      const res = await request(app)
        .get('/v1/vehicles')
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
      expect(res.body.results[0].id).toBe(vehicleOne._id.toHexString());
      expect(res.body.results[1].id).toBe(vehicleTwo._id.toHexString());
    });

    test('should return the correct page if page and limit params are specified', async () => {
      const res = await request(app)
        .get('/v1/vehicles')
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
      expect(res.body.results[0].id).toBe(vehicleThree._id.toHexString());
    });
  });

  describe('GET /v1/vehicles/:vehicleId', () => {
    beforeEach(async () => {
      await insertUsers([admin, userOne]);
      await insertVehicles([vehicleOne, vehicleThree]);
    });
    test('should return 200 and the vehicle if data is ok', async () => {
      const res = await request(app)
        .get(`/v1/vehicles/${vehicleOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        id: expect.anything(),
        owner: vehicleOne.owner.toHexString(),
        plate: vehicleOne.plate,
        model: vehicleOne.model,
      });
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).get(`/v1/vehicles/${vehicleOne._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 200 if non-admin is trying to get vehicle', async () => {
      await request(app)
        .get(`/v1/vehicles/${vehicleOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);
    });

    test('should return 403 error if non-admin is trying to get vehicle for another user', async () => {
      await request(app)
        .get(`/v1/vehicles/${vehicleThree._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 200 and the booking object if admin is trying to get vehicle', async () => {
      await insertUsers([adminThree]);

      await request(app)
        .get(`/v1/vehicles/${vehicleOne._id}`)
        .set('Authorization', `Bearer ${adminThreeAccessToken}`)
        .send()
        .expect(httpStatus.OK);
    });

    test('should return 400 error if vehicleId is not a valid mongo id', async () => {
      await request(app)
        .get('/v1/vehicles/invalidId')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if vehicle is not found', async () => {
      await request(app)
        .get(`/v1/vehicles/${vehicleTwo._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /v1/vehicles/:vehicleId', () => {
    beforeEach(async () => {
      await insertUsers([admin, userOne]);
      await insertVehicles([vehicleOne, vehicleThree]);
    });
    test('should return 204 if data is ok', async () => {
      await request(app)
        .delete(`/v1/vehicles/${vehicleOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbVehicle = await Vehicle.findById(vehicleOne._id);
      expect(dbVehicle).toBeNull();
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).delete(`/v1/vehicles/${vehicleOne._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 error if non-admin is trying to delete vehicle for another user', async () => {
      await request(app)
        .delete(`/v1/vehicles/${vehicleThree._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 204 if admin is trying to delete another user"s vehicle', async () => {
      await request(app)
        .delete(`/v1/vehicles/${vehicleOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);
    });

    test('should return 400 error if vehicleId is not a valid mongo id', async () => {
      await request(app)
        .delete('/v1/vehicles/invalidId')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if vehicle is not found', async () => {
      await request(app)
        .delete(`/v1/vehicles/${vehicleTwo._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /v1/vehicles/:vehicleId', () => {
    let updateBody;
    beforeEach(async () => {
      updateBody = {
        owner: admin._id,
        model: 'Lexus LX570',
        plate: 'KDD 333Z',
      };
      await insertUsers([admin, userOne]);
      await insertVehicles([vehicleOne, vehicleThree]);
    });

    test('should return 200 and successfully update vehicle if data is ok', async () => {
      const res = await request(app)
        .patch(`/v1/vehicles/${vehicleOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        id: vehicleOne._id.toHexString(),
        model: updateBody.model,
        plate: updateBody.plate,
        owner: updateBody.owner,
      });

      const dbVehicle = await Vehicle.findById(vehicleOne._id);
      expect(dbVehicle).toBeDefined();
      expect(dbVehicle.id).toBe(vehicleOne._id.toHexString());
      expect(dbVehicle.plate).toBe(updateBody.plate);
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).patch(`/v1/vehicles/${vehicleOne._id}`).send(updateBody).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 if non-admin is updating vehicle for another user', async () => {
      await request(app)
        .patch(`/v1/vehicles/${vehicleThree._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 200 and successfully update user if admin is updating another user"s vehicle', async () => {
      await insertUsers([adminThree]);
      await request(app)
        .patch(`/v1/vehicles/${vehicleOne._id}`)
        .set('Authorization', `Bearer ${adminThreeAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);
    });

    test('should return 200 if plate is lowercase and return uppercase plate', async () => {
      updateBody.plate = 'klz 675k';
      const res = await request(app)
        .patch(`/v1/vehicles/${vehicleOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      expect(res.body.plate).toBe('KLZ 675K');
    });

    test('should return 404 if vehicle is not found', async () => {
      await request(app)
        .patch(`/v1/vehicles/${vehicleTwo._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 404 if owner is not found', async () => {
      updateBody.owner = userTwo._id;

      await request(app)
        .patch(`/v1/vehicles/${vehicleOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 400 error if vehicleId is not a valid mongo id', async () => {
      await request(app)
        .patch(`/v1/vehicles/invalidId`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if owner is not a valid mongo id', async () => {
      updateBody.owner = 'invalidId';

      await request(app)
        .patch(`/v1/vehicles/${vehicleOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });
  });
});
