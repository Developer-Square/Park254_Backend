const Mpesa = require('mpesa-express');

const options = {
  consumer_key: 'PbEWMtFHZ8lOFo7G5HhgnWS8IfAAyR3c',
  consumer_secret: 'GKoQCvLMpkwrlgTh',
  passKey: 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919',
  BusinessShortCode: 174379,
  SecurityCredential:
    'V0a35DDV6XOguhnADH69VY4UBbt+RJ9igh/Jqed4QRzXqKV0GZ6waof3y8nBXB1mRw4xSCSrh2NC+TwGrxTUR0X1rwI52a/hmNSMAVy/5ms0u8pKN4ER6YJTmWsRQSmvj1kyVRjV5DWGIDPQ4sgvnAHFvlEwD+WMNvNDTFWJMQLhbPtcwBhTVmxoxTpu0DpiwW6+hKpMOD45rMWft1T7g+im01/nkZT9BYwUgLmRuUN+qrLNMWvs2KViaHGwYzoOa0pA9YIKvOryDIsaj6qU5ufxbfQcAuTdqYIJLN+N5VxQlROsJ9HIXMy9mBdhNZYu0cT0r+zPPCmkgsOGbhUgGg==',
  Initiator: 'GKoQCvLMpkwrlgTh',
  callBackBaseUrl: 'https://park254-parking-app-server.herokuapp.com',
};

const mpesa = new Mpesa(options);

module.exports = mpesa;
