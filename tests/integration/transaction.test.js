const request = require('supertest');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const { Transaction } = require('../../src/models');
const { userOne, userTwo, admin, adminTwo, adminThree, insertUsers } = require('../fixtures/user.fixture');
const { transactionOne, transactionTwo, transactionThree, insertTransactions } = require('../fixtures/transaction.fixture');
const { userOneAccessToken, adminAccessToken, adminThreeAccessToken } = require('../fixtures/token.fixture');

setupTestDB();

describe('Transaction routes', () => {
  describe('POST /v1/paymentCallback', () => {
    let newTransaction;

    beforeEach(async () => {
      newTransaction = {
        Body: {
          stkCallback: {
            MerchantRequestID: '29115-34620561-1',
            CheckoutRequestID: 'ws_CO_191220191020363925',
            ResultCode: 0,
            ResultDesc: 'The service request is processed successfully.',
            CallbackMetadata: {
              Item: [
                {
                  Name: 'Amount',
                  Value: 1.0,
                },
                {
                  Name: 'MpesaReceiptNumber',
                  Value: 'NLJ7RT61SV',
                },
                {
                  Name: 'TransactionDate',
                  Value: 20191219102115,
                },
                {
                  Name: 'PhoneNumber',
                  Value: 254708374149,
                },
              ],
            },
          },
        },
      };
    });

    test('should return 200 and successfully create new transaction if data is ok', async () => {
      await request(app).post('/v1/paymentCallback').send(newTransaction).expect(httpStatus.OK);

      const dbTransaction = await Transaction.findById(newTransaction.Body.stkCallback.MerchantRequestID);

      expect(dbTransaction).toBeDefined();
      expect(dbTransaction.MerchantRequestID).toBe(newTransaction.Body.stkCallback.MerchantRequestID);
    });
  });

  describe('GET /v1/mpesa', () => {
    test('should return 200 and apply the default query options', async () => {
      await insertUsers([admin]);
      await insertTransactions([transactionOne, transactionTwo, transactionThree]);

      const res = await request(app)
        .get('/v1/mpesa')
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
      expect(res.body.results[0].id).toBe(transactionOne._id);
    });

    test('should return 401 if access token is missing', async () => {
      await insertTransactions([transactionOne, transactionTwo, transactionThree]);

      await request(app).get('/v1/mpesa').send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 200 if a non-admin is trying to access all transactions', async () => {
      await insertUsers([userOne]);
      await insertTransactions([transactionOne, transactionTwo, transactionThree]);

      await request(app).get('/v1/mpesa').set('Authorization', `Bearer ${userOneAccessToken}`).send().expect(httpStatus.OK);
    });

    test('should correctly apply filter on PhoneNumber field', async () => {
      await insertUsers([admin, adminTwo]);
      await insertTransactions([transactionOne, transactionTwo, transactionThree]);

      const res = await request(app)
        .get('/v1/mpesa')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ PhoneNumber: transactionOne.PhoneNumber })
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
      expect(res.body.results[0].id).toBe(transactionOne._id);
    });

    test('should correctly sort the returned array if descending sort param is specified', async () => {
      await insertUsers([admin]);
      await insertTransactions([transactionOne, transactionTwo, transactionThree]);

      const res = await request(app)
        .get('/v1/mpesa')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ sortBy: 'Amount:desc' })
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
      expect(res.body.results[0].id).toBe(transactionOne._id);
      expect(res.body.results[1].id).toBe(transactionTwo._id);
      expect(res.body.results[2].id).toBe(transactionThree._id);
    });

    test('should correctly sort the returned array if ascending sort param is specified', async () => {
      await insertUsers([admin]);
      await insertTransactions([transactionOne, transactionTwo, transactionThree]);

      const res = await request(app)
        .get('/v1/mpesa')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ sortBy: 'Amount:asc' })
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
      expect(res.body.results[0].id).toBe(transactionThree._id);
      expect(res.body.results[1].id).toBe(transactionTwo._id);
      expect(res.body.results[2].id).toBe(transactionOne._id);
    });

    test('should limit returned array if limit param is specified', async () => {
      await insertUsers([admin]);
      await insertTransactions([transactionOne, transactionTwo, transactionThree]);

      const res = await request(app)
        .get('/v1/mpesa')
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
      expect(res.body.results[0].id).toBe(transactionOne._id);
      expect(res.body.results[1].id).toBe(transactionTwo._id);
    });

    test('should return the correct page if page and limit params are specified', async () => {
      await insertUsers([admin]);
      await insertTransactions([transactionOne, transactionTwo, transactionThree]);

      const res = await request(app)
        .get('/v1/mpesa')
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
      expect(res.body.results[0].id).toBe(transactionThree._id);
    });
  });

  describe('GET /v1/mpesa/:transactionId', () => {
    test('should return 200 and the transaction object if data is ok', async () => {
      await insertUsers([admin]);
      await insertTransactions([transactionOne, transactionTwo, transactionThree]);

      const res = await request(app)
        .get(`/v1/mpesa/${transactionOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body.MerchantRequestID).toBe(transactionOne.MerchantRequestID);
      expect(res.body.id).toBe(transactionOne.MerchantRequestID);
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([admin]);
      await insertTransactions([transactionOne, transactionTwo, transactionThree]);

      await request(app).get(`/v1/mpesa/${transactionOne._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 200 if non-admin is trying to get transaction', async () => {
      await insertUsers([userOne]);
      await insertTransactions([transactionOne, transactionTwo, transactionThree]);

      await request(app)
        .get(`/v1/mpesa/${transactionTwo._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);
    });

    test('should return 200 and the transaction object if admin is trying to get transaction', async () => {
      await insertUsers([adminThree]);
      await insertTransactions([transactionOne, transactionTwo, transactionThree]);

      await request(app)
        .get(`/v1/mpesa/${transactionOne._id}`)
        .set('Authorization', `Bearer ${adminThreeAccessToken}`)
        .send()
        .expect(httpStatus.OK);
    });

    test('should return 404 error if transaction is not found', async () => {
      await insertUsers([admin]);
      await insertTransactions([transactionTwo]);

      await request(app)
        .get(`/v1/mpesa/${transactionOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /v1/mpesa/:transactionId', () => {
    test('should return 204 if data is ok', async () => {
      await insertUsers([admin]);
      await insertTransactions([transactionOne]);

      await request(app)
        .delete(`/v1/mpesa/${transactionOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbTransaction = await Transaction.findById(transactionOne._id);
      expect(dbTransaction).toBeNull();
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([admin]);
      await insertTransactions([transactionOne]);

      await request(app).delete(`/v1/mpesa/${transactionOne._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 error if unauthorized user is trying to delete parking slot', async () => {
      await insertUsers([userOne, userTwo, admin]);
      await insertTransactions([transactionOne]);

      await request(app)
        .delete(`/v1/mpesa/${transactionOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 204 if admin is trying to delete transaction', async () => {
      await insertUsers([admin]);
      await insertTransactions([transactionThree]);

      await request(app)
        .delete(`/v1/mpesa/${transactionThree._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);
    });

    test('should return 404 error if transaction is not found', async () => {
      await insertUsers([admin]);
      await insertTransactions([transactionTwo]);

      await request(app)
        .delete(`/v1/mpesa/${transactionOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('GET /v1/paymentCallback', () => {
    let query;
    beforeEach(() => {
      query = {
        PhoneNumber: transactionOne.PhoneNumber,
        Amount: transactionOne.Amount,
        createdAt: new Date().toISOString(),
      };
    });

    test('should return 200 and the transaction object if data is ok', async () => {
      await insertUsers([admin]);
      await insertTransactions([transactionOne]);

      const res = await request(app)
        .get(`/v1/paymentCallback`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query(query)
        .send()
        .expect(httpStatus.OK);

      expect(res.body.MerchantRequestID).toBe(transactionOne.MerchantRequestID);
      expect(res.body.id).toBe(transactionOne.MerchantRequestID);
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([admin]);
      await insertTransactions([transactionOne]);

      await request(app).get(`/v1/paymentCallback`).query(query).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if PhoneNumber is invalid', async () => {
      query.PhoneNumber = 'invalid';
      await insertUsers([admin]);
      await insertTransactions([transactionOne]);

      await request(app)
        .get(`/v1/paymentCallback`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query(query)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if Amount is invalid', async () => {
      query.Amount = 'invalid';
      await insertUsers([admin]);
      await insertTransactions([transactionOne]);

      await request(app)
        .get(`/v1/paymentCallback`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query(query)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if createdAt is invalid', async () => {
      query.createdAt = 'invalid';
      await insertUsers([admin]);
      await insertTransactions([transactionOne]);

      await request(app)
        .get(`/v1/paymentCallback`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query(query)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    // eslint-disable-next-line jest/no-commented-out-tests
    // test('should return 500 error if transaction fails', async () => {
    //   jest.setTimeout(30000);
    //   await insertUsers([admin]);
    //   await insertTransactions([transactionThree]);

    //   await request(app)
    //     .get(`/v1/paymentCallback`)
    //     .set('Authorization', `Bearer ${adminAccessToken}`)
    //     .query(query)
    //     .send()
    //     .expect(httpStatus.INTERNAL_SERVER_ERROR);
    // });
  });
});
