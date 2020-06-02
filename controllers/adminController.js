const db = require('../models')
const User = db.User
const Tweet = db.Tweet
const moment = require('moment')
const helpers = require("../_helpers")

const adminController = {
  getTweets: async (req, res) => {
    try {
      let tweets = await Tweet.findAll({
        include: [User, { model: User, as: 'LikedUsers' }],
        limit: 20,
        // order: [
        //   ['LikedUsers', 'DESC']
        // ]
      })
      // console.log('tweets[0]', tweets[0])
      tweets = tweets.map(tweet => ({
        ...tweet.dataValues,
        description: tweet.description ? tweet.description.substring(0, 50) : null,
        updatedAt: tweet.updatedAt ? moment(tweet.updatedAt).format('YYYY-MM-DD, hh:mm') : '-',
        // isLiked: tweet.LikedUsers.map(d => d.id).includes(helpers.getUser(req).id),
        likedCount: tweet.LikedUsers.length
      }))
      console.log('tweets', tweets)
      // console.log('tweets.isLiked', tweets.isLiked)
      // console.log('tweets.likedCount', tweets.likedCount)
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
