const nodemailer = require('nodemailer');
const config = require('../config/config');
const logger = require('../config/logger');

const transport = nodemailer.createTransport(config.email.smtp);
/* istanbul ignore next */
if (config.env !== 'test') {
  transport
    .verify()
    .then(() => logger.info('Connected to email server'))
    .catch(() => logger.warn('Unable to connect to email server. Make sure you have configured the SMTP options in .env'));
}

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @returns {Promise}
 */
const sendEmail = async (to, subject, text, html) => {
  const msg = { from: config.email.from, to, subject, text, html };
  await transport.sendMail(msg);
};

/**
 * Send reset password email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendResetPasswordEmail = async (to, token) => {
  const subject = 'Reset password';
  const text = `Dear user,
  To reset your password, copy this token: ${token}.
  Paste the token in the app. If you did not request any password resets, then ignore this email.`;
  const html = `<h4 style='font-weight:bold;'>Dear user,</h4>
  <p>To reset your password, copy this token: <span style='font-weight:bold;'>${token}</span>.</p>
  <p>Paste the token in the app and request a new password.</p> 
  <p>If you did not request any password resets, please ignore this email.</p>
  <p>Thanks,</p>
  <p style='font-weight:bold;'>Park254 Team</p>`;
  await sendEmail(to, subject, text, html);
};

module.exports = {
  transport,
  sendEmail,
  sendResetPasswordEmail,
};
