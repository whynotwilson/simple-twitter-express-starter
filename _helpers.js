const moment = require('moment')

function ensureAuthenticated(req) {
  return req.isAuthenticated();
}

function getUser(req) {
  return req.user;
}

function fromNow(dateTime) {
  return moment(dateTime).fromNow()
}

module.exports = {
  ensureAuthenticated,
  getUser,
  fromNow
};