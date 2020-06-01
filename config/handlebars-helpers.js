const moment = require('moment')

module.exports = {
  fromNow: function (dateTime) {
    return moment(dateTime).fromNow()
  },

  ifCond: function (a, b, options) {
    if (a === b) {
      return options.fn(this)
    }
    return options.inverse(this)
  },

  ifNotCond: function (a, b, options) {
    if (a !== b) {
      return options.fn(this)
    }
    return options.inverse(this)
  }
}
