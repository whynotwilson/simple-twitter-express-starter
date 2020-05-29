// 引入資料庫
const db = require('../models')
const User = db.User
const Tweet = db.Tweet
const moment = require('moment')

const userController = {

  getTweets: (req, res) => {

    // async writing
    // try {
    //   const userId = req.params.id
    //   // const { user } = await User.findByPk(userId) 
    //   // if (!user) {
    //   //   throw new Error("user is not found")
    //   // }
    //   const { tweets } = await Tweet.findAll({ raw: true, next: true, where: { UserId: userId } })

    //   let isOwn = userId === req.user.id ? true : false
    //   return render('getTweets', { user: user, tweets: tweets, isOwn: isOwn })
    // } catch (error) {
    //   console.log('error', error)
    // }
    const userId = req.params.id

    User.findByPk(userId).then((user) => {
      if (!user) throw new Error("user not found")

      return Tweet.findAll({ raw: true, next: true, where: { UserId: userId } }).then((tweets) => {

        console.log(user)
        tweets = tweets.map(tweet => ({
          ...tweet,
          description: tweet.description ? tweet.description.substring(0, 50) : null,
          updatedAt: tweet.updatedAt ? moment(tweet.updatedAt).format(`YYYY-MM-DD, hh:mm`) : '-'
        }))
        // let isOwn = userId === req.user.id ? true : false

        return res.render('getTweets', { user: user, tweets: tweets })
      })
    })
  },
  getFollowings: (req, res) => {

  },
  getFollowers: (req, res) => {

  },
  getLikes: (req, res) => {

  },
  postFollow: (req, res) => {

  },
  deleteFollow: (req, res) => {

  },
  getEdit: (req, res) => {

  },
  putEdit: (req, res) => {

  }
}

module.exports = userController