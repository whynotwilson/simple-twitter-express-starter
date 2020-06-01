const db = require('../models')
const User = db.User
const Tweet = db.Tweet
const moment = require('moment')

const adminController = {
  getTweets: async (req, res) => {
    try {
      const dataValues = await Tweet.findAll({
        include: [User],
        raw: true,
        nest: true,
        limit: 20,
        order: [
          ['likedCounter', 'DESC']
        ]
      })

      const tweets = dataValues.map(tweet => ({
        ...tweet,
        description: tweet.description ? tweet.description.substring(0, 50) : null,
        updatedAt: tweet.updatedAt ? moment(tweet.updatedAt).format('YYYY-MM-DD, hh:mm') : '-'
      }))
      // return res.render('/admin/tweets')
      return res.render('admin/tweets', { tweets })
    } catch (error) {
      console.log(error)
    }
  },

  deleteTweet: async (req, res) => {
    try {
      const tweet = await Tweet.findByPk(req.params.id)
      await tweet.destroy()
      return res.redirect('/admin')
    } catch (error) {
      console.log(error)
    }
  },

  getUsers: async (req, res) => {
    try {
      let users = await User.findAll({
        // raw: true,
        // nest: true,
        limit: 20,
        include: [
          { model: User, as: 'Followers' }
        ]
      })

      users = users.map(user => ({
        ...user.dataValues,
        FollowerCount: user.Followers.length,
        createdAt: user.createdAt.toISOString().slice(0, 10)
      }))

      // 依追蹤者人數排序清單
      users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)
      return res.render('admin/users', { users })
    } catch (error) {
      console.log(error)
    }
  }
}

module.exports = adminController
