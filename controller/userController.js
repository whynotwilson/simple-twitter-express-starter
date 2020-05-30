// 引入資料庫
const db = require('../models')
const User = db.User
const Tweet = db.Tweet
const Like = db.Like
const Reply = db.Reply
const moment = require('moment')
const Followship = db.Followship

const fs = require('fs')

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
  getFollowers: async (req, res) => {
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


      const followers = dataValues.Followers.map(follower => ({
        ...follower.dataValues,
        introduction: follower.introduction ? follower.introduction.substring(0, 20) : null,
      }))

      const followings = dataValues.Followings.map(following => ({
        ...following.dataValues,
      }))


      // 確認是否追蹤
      const isFollowing = followings.every((following) => {
        followers.every((follower) => {
          following.id === follower.id
        })
      })


      return res.render('getFollowers', { user: user, followers: followers, isFollowing: isFollowing })
    } catch (error) {
      console.log('error', error)
    }
  },
  getLikes: async (req, res) => {
    try {
      //判斷是否為isOwn

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
      let Tweets = {}
      Tweets = await Tweet.findAll({ raw: true, nest: true },
        { include: User })

      let user = {}
      user = { ...dataValues, introduction: dataValues.introduction ? dataValues.introduction.substring(0, 30) : null }

      const likedTweets = Tweets.filter(tweet =>
        user.Likes.map(like => like.dataValues.TweetId).includes(tweet.id)
      )

      const tweets = likedTweets.map(tweet => ({
        ...tweet,
        description: tweet.description ? tweet.description.substring(0, 50) : null,
        updatedAt: tweet.updatedAt ? moment(tweet.updatedAt).format(`YYYY-MM-DD, hh:mm`) : '-'
      }))

      // let isOwn = userId === req.user.id ? true : false

      return res.render('getLikes', { user, tweets })
    } catch (error) {
      console.log('error', error)
    }
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
  getEdit: async (req, res) => {
    try {
      //驗證isOwn
      // let isOwn = userId === req.user.id ? true : false

      const userId = req.params.id
      const { dataValues } = await User.findByPk(userId) ? await User.findByPk(userId) : null

      if (!dataValues) {
        throw new Error("user is not found")
      }
      let user = {}
      user = { ...dataValues }

      return res.render('getEdit', { user })
    } catch (error) {
      console.log('error', error)
    }
  },
  postEdit: async (req, res) => {
    try {
      // if (!req.body.name) {
      //   req.flash('error_messages', "請至少輸入姓名")
      //   return res.redirect('back')
      // }
      const userId = req.params.id

      const { file } = req
      if (file) {

        const data = fs.readFileSync(file.path)
        const writeFile = fs.writeFileSync(`upload/${file.originalname}`, data)

        const updateUser = await User.findByPk(userId).then((user) => {
          user.update({
            name: req.body.name,
            introduction: req.body.introduction,
            avatar: file ? `/upload/${file.originalname}` : null
          })
        })

        // 可以加flash - 更新成功

        return res.redirect(`/users/${userId}/edit`)

      } else {

        const updateUser = await User.findByPk(userId).then((user) => {
          user.update({
            name: req.body.name,
            introduction: req.body.introduction,
            avatar: this.avatar
          })
        })

        return res.redirect(`/users/${userId}/tweets`)

      }
    } catch (error) {
      console.log('error', error)
    }

  }
}

module.exports = userController