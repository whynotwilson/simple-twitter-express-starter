const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const Tweet = db.Tweet
const Like = db.Like
const Reply = db.Reply
const moment = require('moment')
const Followship = db.Followship
const fs = require('fs')

const adminController = {
  addTweets: async (req, res) => {
    const { dataValues } = await Tweet.findAll({
      raw: true,
      nest: true,
      limit: 20,
      order: 'DESC'
    })

    const tweets = dataValues.Tweets.map(tweet => ({
      ...tweet,
      description: tweet.description ? tweet.description.substring(0, 50) : null,
      updatedAt: tweet.updatedAt ? moment(tweet.updatedAt).format('YYYY-MM-DD, hh:mm') : '-'
    }))
    return res.render('/admin/tweets', { tweets })
  }
}

module.exports = adminController
