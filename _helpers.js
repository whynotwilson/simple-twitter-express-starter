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

function getKeywordData(keyword) {
  console.log('helper', keyword)
  console.log('keyword!')
}

module.exports = {
  ensureAuthenticated,
  getUser,
  fromNow,
  getKeywordData
};