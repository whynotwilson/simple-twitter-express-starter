const moment = require('moment')

module.exports = {
  fromNow: function (dateTime) {
    return moment(dateTime).fromNow()
  }
}