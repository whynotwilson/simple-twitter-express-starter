const db = require('../models')
const User = db.User
const Tweet = db.Tweet
const Reply = db.Reply
const moment = require('moment')

const adminController = {
  getTweets: async (req, res) => {
    try {
      let tweets = await Tweet.findAll({
        include: [User,
          { model: Reply, include: [User] },
          { model: User, as: 'LikedUsers' }
        ],
        //limit: 50
      })

      // 整理 tweets 資料，把 dataValues 都拿掉
      // ex: tweets.dataValues.User.dataValues => tweets.User
      // ex: tweets.dataValues.Replies.dataValues.User.dataValues => tweets.Replies.User
      tweets = tweets.map(tweet => ({
        ...tweet.dataValues,

        User: tweet.dataValues.User.dataValues,

        Replies: tweet.dataValues.Replies.map(reply => ({
          ...reply.dataValues,
          User: reply.User.dataValues
        })),

        LikedUsers: tweet.dataValues.LikedUsers.map(user => ({
          ...user.dataValues
        })),

        description: tweet.description ? tweet.description : '',
        updatedAt: tweet.updatedAt ? moment(tweet.updatedAt).format('YYYY-MM-DD, hh:mm') : '-',
        likedCount: tweet.LikedUsers.length
      }))

      tweets = tweets.sort((a, b) =>
        b.likedCount - a.likedCount
      )

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
        // limit: 20,
        include: [
          Tweet,
          { model: User, as: 'Followers' },
          { model: User, as: 'Followings' },
          { model: Tweet, as: 'LikedTweets' }
        ]
      })

      users = users.map(user => ({
        ...user.dataValues,
        Followers: user.dataValues.Followers.map(follower => ({
          ...follower.dataValues
        })),

        Followings: user.dataValues.Followings.map(following => ({
          ...following.dataValues
        })),

        LikedTweets: user.dataValues.LikedTweets.map(likedTweet => ({
          ...likedTweet.dataValues
        })),

        Tweets: user.dataValues.Tweets.map(tweet => ({
          ...tweet.dataValues
        }))
      }))

      // 依發文數量排序，由多至少
      users = users.sort((a, b) => b.Tweets.length - a.Tweets.length)

      return res.render('admin/users', { users })
    } catch (error) {
      console.log(error)
    }
  }
}

module.exports = adminController
