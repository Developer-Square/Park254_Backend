const request = require('supertest');
const faker = require('faker');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const { Booking } = require('../../src/models');
const { userOne, admin, adminThree, insertUsers, userTwo } = require('../fixtures/user.fixture');
const { parkingLotOne, parkingLotTwo, parkingLotThree, insertParkingLots } = require('../fixtures/parkingLot.fixture');
const { userOneAccessToken, adminAccessToken, adminThreeAccessToken } = require('../fixtures/token.fixture');
const { bookingOne, bookingTwo, bookingThree, insertBookings, bookingFour } = require('../fixtures/booking.fixture');

setupTestDB();

describe('Booking routes', () => {
  describe('POST /v1/bookings', () => {
    let newBooking;

    beforeEach(async () => {
      newBooking = {
        parkingLotId: parkingLotOne._id,
        clientId: userOne._id,
        entryTime: '2021-08-22T11:30:20.381Z',
        exitTime: '2021-08-22T12:30:20.381Z',
        spaces: 2,
      };
    });

    test('should return 201 and successfully create new booking if data is ok', async () => {
      await insertUsers([userOne]);
      await insertParkingLots([parkingLotOne]);

      const res = await request(app)
        .post('/v1/bookings')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newBooking)
        .expect(httpStatus.CREATED);

      expect(res.body.spaces).toBe(newBooking.spaces);

      const dbBooking = await Booking.findById(res.body.id);

      expect(dbBooking).toBeDefined();
      expect(dbBooking.spaces).toBe(newBooking.spaces);
      expect(dbBooking.isCancelled).toBe(false);
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).post('/v1/bookings').send(newBooking).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 201 if logged in user is admin', async () => {
      await insertUsers([admin, userOne]);
      await insertParkingLots([parkingLotOne]);

      await request(app)
        .post('/v1/bookings')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newBooking)
        .expect(httpStatus.CREATED);
    });

    test('should return 400 error if parkingLotId is not a valid mongo id', async () => {
      await insertUsers([userOne]);
      await insertParkingLots([parkingLotOne]);
      newBooking.parkingLotId = 'invalidId';

      await request(app)
        .post('/v1/bookings')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newBooking)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if clientId is not a valid mongo id', async () => {
      await insertUsers([userOne]);
      await insertParkingLots([parkingLotOne]);
      newBooking.clientId = 'invalidId';

      await request(app)
        .post('/v1/bookings')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newBooking)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if spaces is less than 1', async () => {
      await insertUsers([userOne]);
      await insertParkingLots([parkingLotOne]);
      newBooking.spaces = 0;

      await request(app)
        .post('/v1/bookings')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newBooking)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if spaces is more than available spaces', async () => {
      await insertUsers([userOne]);
      await insertParkingLots([parkingLotOne]);
      await insertBookings([bookingOne]);
      newBooking.spaces = 780;

      await request(app)
        .post('/v1/bookings')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newBooking)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if spaces is more than total parking spaces', async () => {
      await insertUsers([userOne]);
      await insertParkingLots([parkingLotOne]);
      newBooking.spaces = 900;

      await request(app)
        .post('/v1/bookings')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newBooking)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if parking lot does not exist', async () => {
      await insertUsers([userOne]);
      await insertParkingLots([parkingLotOne]);
      newBooking.parkingLotId = parkingLotTwo._id;

      await request(app)
        .post('/v1/bookings')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newBooking)
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 404 error if client does not exist', async () => {
      await insertUsers([admin]);
      await insertParkingLots([parkingLotOne]);

      await request(app)
        .post('/v1/bookings')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newBooking)
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 403 error if client is not admin and tries to create booking for another client', async () => {
      await insertUsers([userOne, userTwo]);
      await insertParkingLots([parkingLotOne]);
      newBooking.clientId = userTwo._id;

      await request(app)
        .post('/v1/bookings')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newBooking)
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 400 error if entry time is greater than leaving time', async () => {
      await insertUsers([userOne]);
      await insertParkingLots([parkingLotOne]);
      newBooking.exitTime = faker.date.past(1, new Date().toISOString());

      await request(app)
        .post('/v1/bookings')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newBooking)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('GET /v1/bookings', () => {
    test('should return 200 and apply the default query options', async () => {
      await insertUsers([admin, userOne]);
      await insertParkingLots([parkingLotOne, parkingLotTwo]);
      await insertBookings([bookingOne, bookingTwo, bookingThree]);

      const res = await request(app)
        .get('/v1/bookings')
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
      expect(res.body.results[0].id).toBe(bookingOne._id);
    });

    test('should return 401 if access token is missing', async () => {
      await insertUsers([admin, userOne]);
      await insertParkingLots([parkingLotOne, parkingLotTwo]);
      await insertBookings([bookingOne, bookingTwo, bookingThree]);

      await request(app).get('/v1/bookings').send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 200 if a non-admin is trying to access all bookings', async () => {
      await insertUsers([admin, userOne]);
      await insertParkingLots([parkingLotOne, parkingLotTwo]);
      await insertBookings([bookingOne, bookingTwo, bookingThree]);

      await request(app)
        .get('/v1/bookings')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);
    });

    test('should correctly apply filter on parkingLotId field', async () => {
      await insertUsers([admin, userOne]);
      await insertParkingLots([parkingLotOne, parkingLotTwo]);
      await insertBookings([bookingOne, bookingTwo, bookingThree]);

      const res = await request(app)
        .get('/v1/bookings')
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
      expect(res.body.results[0].id).toBe(bookingOne._id);
      expect(res.body.results[1].id).toBe(bookingThree._id.toHexString());
    });

    test('should correctly apply filter on clientId field', async () => {
      await insertUsers([admin, userOne]);
      await insertParkingLots([parkingLotOne, parkingLotTwo]);
      await insertBookings([bookingOne, bookingTwo, bookingThree]);

      const res = await request(app)
        .get('/v1/bookings')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ clientId: admin._id })
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
      expect(res.body.results[0].id).toBe(bookingThree._id.toHexString());
    });

    test('should correctly apply filter on isCancelled field', async () => {
      await insertUsers([admin, userOne]);
      await insertParkingLots([parkingLotOne, parkingLotTwo]);
      await insertBookings([bookingOne, bookingTwo, bookingThree]);

      const res = await request(app)
        .get('/v1/bookings')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ isCancelled: true })
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
      expect(res.body.results[0].id).toBe(bookingThree._id.toHexString());
    });

    test('should correctly sort the returned array if descending sort param is specified', async () => {
      await insertUsers([admin, userOne]);
      await insertParkingLots([parkingLotOne, parkingLotTwo]);
      await insertBookings([bookingOne, bookingTwo, bookingThree]);

      const res = await request(app)
        .get('/v1/bookings')
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
      expect(res.body.results[0].id).toBe(bookingThree._id.toHexString());
      expect(res.body.results[1].id).toBe(bookingTwo._id.toHexString());
      expect(res.body.results[2].id).toBe(bookingOne._id);
    });

    test('should correctly sort the returned array if ascending sort param is specified', async () => {
      await insertUsers([admin, userOne]);
      await insertParkingLots([parkingLotOne, parkingLotTwo]);
      await insertBookings([bookingOne, bookingTwo, bookingThree]);

      const res = await request(app)
        .get('/v1/bookings')
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
      expect(res.body.results[0].id).toBe(bookingOne._id);
      expect(res.body.results[1].id).toBe(bookingTwo._id.toHexString());
      expect(res.body.results[2].id).toBe(bookingThree._id.toHexString());
    });

    test('should limit returned array if limit param is specified', async () => {
      await insertUsers([admin, userOne]);
      await insertParkingLots([parkingLotOne, parkingLotTwo]);
      await insertBookings([bookingOne, bookingTwo, bookingThree]);

      const res = await request(app)
        .get('/v1/bookings')
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
      expect(res.body.results[0].id).toBe(bookingOne._id);
      expect(res.body.results[1].id).toBe(bookingTwo._id.toHexString());
    });

    test('should return the correct page if page and limit params are specified', async () => {
      await insertUsers([admin, userOne]);
      await insertParkingLots([parkingLotOne, parkingLotTwo]);
      await insertBookings([bookingOne, bookingTwo, bookingThree]);

      const res = await request(app)
        .get('/v1/bookings')
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
      expect(res.body.results[0].id).toBe(bookingThree._id.toHexString());
    });
  });

  describe('GET /v1/bookings/:bookingId', () => {
    test('should return 200 and the booking object if data is ok', async () => {
      await insertUsers([admin, userOne]);
      await insertParkingLots([parkingLotOne, parkingLotTwo]);
      await insertBookings([bookingOne, bookingTwo, bookingThree]);

      const res = await request(app)
        .get(`/v1/bookings/${bookingOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body.spaces).toBe(bookingOne.spaces);
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([admin, userOne]);
      await insertParkingLots([parkingLotOne, parkingLotTwo]);
      await insertBookings([bookingOne, bookingTwo, bookingThree]);

      await request(app).get(`/v1/bookings/${bookingOne._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 200 if non-admin is trying to get booking', async () => {
      await insertUsers([admin, userOne]);
      await insertParkingLots([parkingLotOne, parkingLotTwo]);
      await insertBookings([bookingOne, bookingTwo, bookingThree]);

      await request(app)
        .get(`/v1/bookings/${bookingTwo._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);
    });

    test('should return 403 error if non-admin is trying to get booking for another user', async () => {
      await insertUsers([admin, userOne]);
      await insertParkingLots([parkingLotOne, parkingLotTwo]);
      await insertBookings([bookingOne, bookingTwo, bookingThree]);

      await request(app)
        .get(`/v1/bookings/${bookingThree._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 200 and the booking object if admin is trying to get booking', async () => {
      await insertUsers([admin, userOne, adminThree]);
      await insertParkingLots([parkingLotOne, parkingLotTwo]);
      await insertBookings([bookingOne, bookingTwo, bookingThree]);

      await request(app)
        .get(`/v1/bookings/${bookingOne._id}`)
        .set('Authorization', `Bearer ${adminThreeAccessToken}`)
        .send()
        .expect(httpStatus.OK);
    });

    test('should return 400 error if bookingId is not a valid mongo id', async () => {
      await insertUsers([admin, userOne]);
      await insertParkingLots([parkingLotOne, parkingLotTwo]);
      await insertBookings([bookingOne, bookingTwo, bookingThree]);

      await request(app)
        .get('/v1/bookings/invalidId')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if booking is not found', async () => {
      await insertUsers([admin, userOne]);
      await insertParkingLots([parkingLotOne, parkingLotTwo]);
      await insertBookings([bookingTwo, bookingThree]);

      await request(app)
        .get(`/v1/bookings/${bookingOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /v1/bookings/:bookingId', () => {
    test('should return 204 if data is ok', async () => {
      await insertUsers([admin, userOne]);
      await insertParkingLots([parkingLotOne, parkingLotTwo]);
      await insertBookings([bookingOne, bookingTwo, bookingThree]);

      await request(app)
        .delete(`/v1/bookings/${bookingOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbBooking = await Booking.findById(bookingOne._id);
      expect(dbBooking).toBeNull();
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([admin, userOne]);
      await insertParkingLots([parkingLotOne, parkingLotTwo]);
      await insertBookings([bookingOne, bookingTwo, bookingThree]);

      await request(app).delete(`/v1/bookings/${bookingOne._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 error if non-admin is trying to delete booking for another user', async () => {
      await insertUsers([admin, userOne, userTwo]);
      await insertParkingLots([parkingLotOne, parkingLotTwo]);
      await insertBookings([bookingOne, bookingTwo, bookingThree]);

      await request(app)
        .delete(`/v1/bookings/${bookingThree._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 204 if admin is trying to delete another user"s booking', async () => {
      await insertUsers([admin, userOne]);
      await insertParkingLots([parkingLotOne, parkingLotTwo]);
      await insertBookings([bookingOne, bookingTwo, bookingThree]);

      await request(app)
        .delete(`/v1/bookings/${bookingTwo._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);
    });

    test('should return 400 error if parkingLotId is not a valid mongo id', async () => {
      await insertUsers([admin, userOne]);
      await insertParkingLots([parkingLotOne, parkingLotTwo]);
      await insertBookings([bookingOne, bookingTwo, bookingThree]);

      await request(app)
        .delete('/v1/bookings/invalidId')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if booking is not found', async () => {
      await insertUsers([admin, userOne]);
      await insertParkingLots([parkingLotOne, parkingLotTwo]);
      await insertBookings([bookingTwo, bookingThree]);

      await request(app)
        .delete(`/v1/bookings/${bookingOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /v1/bookings/:bookingId', () => {
    let updateBody;
    beforeEach(() => {
      const arrivalTime = faker.date.future(1, new Date().toISOString());
      updateBody = {
        parkingLotId: parkingLotTwo._id,
        entryTime: arrivalTime,
        exitTime: faker.date.future(1, arrivalTime),
        spaces: 7,
      };
    });

    test('should return 200 and successfully update booking if data is ok', async () => {
      await insertUsers([admin, userOne]);
      await insertParkingLots([parkingLotOne, parkingLotTwo]);
      await insertBookings([bookingOne, bookingTwo, bookingThree]);

      const res = await request(app)
        .patch(`/v1/bookings/${bookingOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      expect(res.body.spaces).toBe(updateBody.spaces);

      const dbBooking = await Booking.findById(bookingOne._id);
      expect(dbBooking).toBeDefined();
      expect(dbBooking.spaces).toBe(updateBody.spaces);
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([admin, userOne]);
      await insertParkingLots([parkingLotOne, parkingLotTwo]);
      await insertBookings([bookingOne, bookingTwo, bookingThree]);

      await request(app).patch(`/v1/bookings/${bookingOne._id}`).send(updateBody).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 if non-admin is updating booking for another user', async () => {
      await insertUsers([admin, userOne]);
      await insertParkingLots([parkingLotOne, parkingLotTwo]);
      await insertBookings([bookingOne, bookingTwo, bookingThree]);

      await request(app)
        .patch(`/v1/bookings/${bookingThree._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 200 and successfully update user if admin is updating another user"s booking', async () => {
      await insertUsers([admin, userOne, adminThree]);
      await insertParkingLots([parkingLotOne, parkingLotTwo]);
      await insertBookings([bookingOne, bookingTwo, bookingThree]);

      await request(app)
        .patch(`/v1/bookings/${bookingOne._id}`)
        .set('Authorization', `Bearer ${adminThreeAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);
    });

    test('should return 404 if booking is not found', async () => {
      await insertUsers([admin, userOne]);
      await insertParkingLots([parkingLotOne, parkingLotTwo]);
      await insertBookings([bookingTwo, bookingThree]);

      await request(app)
        .patch(`/v1/bookings/${bookingOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 404 if parkingLot is not found', async () => {
      await insertUsers([admin, userOne]);
      await insertParkingLots([parkingLotOne, parkingLotTwo]);
      await insertBookings([bookingOne, bookingTwo, bookingThree]);
      updateBody.parkingLotId = parkingLotThree._id;

      await request(app)
        .patch(`/v1/bookings/${bookingOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 400 error if bookingId is not a valid mongo id', async () => {
      await insertUsers([admin, userOne]);
      await insertParkingLots([parkingLotOne, parkingLotTwo]);
      await insertBookings([bookingOne, bookingTwo, bookingThree]);

      await request(app)
        .patch(`/v1/bookings/invalidId`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if parkingLotId is not a valid mongo id', async () => {
      await insertUsers([admin, userOne]);
      await insertParkingLots([parkingLotOne, parkingLotTwo]);
      await insertBookings([bookingOne, bookingTwo, bookingThree]);
      updateBody.parkingLotId = 'invalidId';

      await request(app)
        .patch(`/v1/bookings/${bookingOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if spaces is less than 1', async () => {
      await insertUsers([admin, userOne]);
      await insertParkingLots([parkingLotOne, parkingLotTwo]);
      await insertBookings([bookingOne, bookingTwo, bookingThree]);
      updateBody.spaces = 0;

      await request(app)
        .patch(`/v1/bookings/${bookingOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if space exceeds total parking spaces', async () => {
      await insertUsers([admin, userOne]);
      await insertParkingLots([parkingLotOne, parkingLotTwo]);
      await insertBookings([bookingOne, bookingTwo, bookingThree]);
      updateBody.spaces = 900;

      await request(app)
        .patch(`/v1/bookings/${bookingOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if space exceeds available spaces', async () => {
      await insertUsers([admin, userOne]);
      await insertParkingLots([parkingLotOne, parkingLotTwo]);
      await insertBookings([bookingOne, bookingTwo, bookingThree]);
      updateBody.spaces = 780;
      updateBody.entryTime = '2021-08-22T11:30:20.381Z';
      updateBody.exitTime = '2021-08-22T12:30:20.381Z';

      await request(app)
        .patch(`/v1/bookings/${bookingThree._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('POST /v1/bookings/:bookingId', () => {
    test('should return 200 if data is ok', async () => {
      await insertUsers([admin, userOne]);
      await insertParkingLots([parkingLotOne, parkingLotTwo]);
      await insertBookings([bookingOne, bookingTwo, bookingThree]);

      await request(app)
        .post(`/v1/bookings/${bookingOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      const dbBooking = await Booking.findById(bookingOne._id);
      expect(dbBooking.isCancelled).toBe(true);
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([admin, userOne]);
      await insertParkingLots([parkingLotOne, parkingLotTwo]);
      await insertBookings([bookingOne, bookingTwo, bookingThree]);

      await request(app).post(`/v1/bookings/${bookingOne._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if bookingId is invalid', async () => {
      await insertUsers([admin, userOne]);
      await insertParkingLots([parkingLotOne, parkingLotTwo]);
      await insertBookings([bookingOne, bookingTwo, bookingThree]);

      await request(app)
        .post(`/v1/bookings/invalidId`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 403 error if non-admin is trying to cancel another user"s booking', async () => {
      await insertUsers([admin, userOne]);
      await insertParkingLots([parkingLotOne, parkingLotTwo]);
      await insertBookings([bookingOne, bookingTwo, bookingThree]);

      await request(app)
        .post(`/v1/bookings/${bookingThree._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });
  });

  describe('POST /v1/spaces', () => {
    let query;
    beforeEach(async () => {
      query = {
        parkingLots: ['6ebac534954b54139806c678'],
        entryTime: '2021-08-22T11:30:20.381Z',
        exitTime: '2021-08-22T12:30:20.381Z',
      };
    });

    // eslint-disable-next-line jest/no-commented-out-tests
    // test('should return 200 if data is ok', async () => {
    //   await insertUsers([admin, userOne]);
    //   await insertParkingLots([parkingLotOne, parkingLotTwo]);
    //   await insertBookings([bookingOne, bookingFour]);

    //   const res = await request(app)
    //     .post(`/v1/spaces`)
    //     .set('Authorization', `Bearer ${adminAccessToken}`)
    //     .send(query)
    //     .expect(httpStatus.OK);

    //   expect(res.body.results[0].id).toBe(bookingOne._id);
    //   expect(res.body.results[0].occupiedSpaces).toBe(bookingOne.spaces);
    //   expect(res.body.results[0].availableSpaces).toBe(parkingLotOne.spaces - bookingOne.spaces);
    //   expect(res.body.results[0].available).toBe(true);
    // });

    // eslint-disable-next-line jest/no-commented-out-tests
    // test('should return 200 and available should be false if space is full', async () => {
    //   query.parkingLots[0] = '6ebac534954b54139806c679';
    //   await insertUsers([admin, userOne]);
    //   await insertParkingLots([parkingLotOne, parkingLotTwo]);
    //   await insertBookings([bookingOne, bookingFour]);

    //   const res = await request(app)
    //     .post(`/v1/spaces`)
    //     .set('Authorization', `Bearer ${adminAccessToken}`)
    //     .send(query)
    //     .expect(httpStatus.OK);

    //   expect(res.body.results[0].id).toBe(bookingFour._id);
    //   expect(res.body.results[0].occupiedSpaces).toBe(bookingFour.spaces);
    //   expect(res.body.results[0].availableSpaces).toBe(parkingLotOne.spaces - bookingFour.spaces);
    //   expect(res.body.results[0].available).toBe(false);
    // });

    test('should return 404 error if there are no bookings for the given time', async () => {
      query.entryTime = new Date().toISOString();
      query.exitTime = faker.date.future(1, new Date().toISOString());
      await insertUsers([admin, userOne]);
      await insertParkingLots([parkingLotOne, parkingLotTwo]);
      await insertBookings([bookingOne, bookingFour]);

      await request(app)
        .post(`/v1/spaces`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(query)
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 400 error if the parkingLot ids are not valid mongo ids', async () => {
      await insertUsers([admin, userOne]);
      await insertParkingLots([parkingLotOne, parkingLotTwo]);
      await insertBookings([bookingOne, bookingFour]);
      query.parkingLots = ['invalidId'];

      await request(app)
        .post(`/v1/spaces`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(query)
        .expect(httpStatus.BAD_REQUEST);
    });
  });
});
