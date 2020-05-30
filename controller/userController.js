// 引入資料庫
const db = require('../models')
const User = db.User
const Tweet = db.Tweet
const Like = db.Like
const Reply = db.Reply
const moment = require('moment')
const Followship = db.Followship


const userController = {

  getTweets: async (req, res) => {

    try {
      const userId = req.params.id
      const { dataValues } = await User.findByPk(userId) ? await User.findByPk(userId, {
        include: [
          { model: User, as: 'Followers' },
          { model: User, as: 'Followings' },
          Like,
          Tweet,
          Reply
        ]
      }) : null

      if (!dataValues) {
        throw new Error("user is not found")
      }
      let user = {}
      user = { ...dataValues, introduction: dataValues.introduction ? dataValues.introduction.substring(0, 30) : null }

      const tweets = dataValues.Tweets.map(tweet => ({
        ...tweet,
        description: tweet.description ? tweet.description.substring(0, 50) : null,
        updatedAt: tweet.updatedAt ? moment(tweet.updatedAt).format(`YYYY-MM-DD, hh:mm`) : '-'
      }))

      // let isOwn = userId === req.user.id ? true : false

      return res.render('getTweets', { user, tweets })
    } catch (error) {
      console.log('error', error)
    }

    // then writing
    // const userId = req.params.id

    // User.findByPk(userId).then((user) => {
    //   if (!user) throw new Error("user not found")

    //   return Tweet.findAll({ raw: true, next: true, where: { UserId: userId } }).then((tweets) => {

    //     console.log(user)
    //     tweets = tweets.map(tweet => ({
    //       ...tweet,
    //       description: tweet.description ? tweet.description.substring(0, 50) : null,
    //       updatedAt: tweet.updatedAt ? moment(tweet.updatedAt).format(`YYYY-MM-DD, hh:mm`) : '-'
    //     }))
    //     // let isOwn = userId === req.user.id ? true : false

    //     return res.render('getTweets', { user: user, tweets: tweets })
    //   })
    // })
  },
  getFollowings: async (req, res) => {
    try {
      // let isOwn = userId === req.user.id ? true : false
      //判斷不是owner 要退出

      const userId = req.params.id
      const { dataValues } = await User.findByPk(userId) ? await User.findByPk(userId, {
        include: [
          { model: User, as: 'Followers' },
          { model: User, as: 'Followings' },
          Like,
          Tweet,
          Reply
        ]
      }) : null

      if (!dataValues) {
        throw new Error("user is not found")
      }
      let user = {}
      user = { ...dataValues, introduction: dataValues.introduction ? dataValues.introduction.substring(0, 30) : null }


      const followings = dataValues.Followings.map(following => ({
        ...following.dataValues,
        introduction: following.introduction ? following.introduction.substring(0, 20) : null,
      }))

      return res.render('getFollowings', { user: user, followings: followings })
    } catch (error) {
      console.log('error', error)
    }
  },
  getFollowers: (req, res) => {

  },
  getLikes: (req, res) => {

  },
  addFollowing: async (req, res) => {
    try {
      const newFollow = await Followship.create({
        followerId: req.user.id,
        followingId: req.params.userId
      })

      return res.redirect('back')
    } catch (error) {
      console.log('error', error)
    }
  },
  deleteFollowing: async (req, res) => {
    try {
      const destroyFollow = await Followship.findOne({
        where: {
          followerId: req.user.id,
          followingId: req.params.userId
        }
      }).then((followship) => {
        followship.destroy()
      })

      return res.redirect('back')
    } catch (error) {
      console.log('error', error)
    }
  },
  getEdit: (req, res) => {

  },
  putEdit: (req, res) => {

  }
}

module.exports = userController