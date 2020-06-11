const db = require('../models')
const User = db.User
const Tweet = db.Tweet
const Reply = db.Reply
const sequelize = require('sequelize')
const moment = require('moment')
const allTweetsPageLimit = 20
const allUsersPageLimit = 5

const adminController = {
  getTweets: async (req, res) => {
    try {
      let offset = 0

      // 計算目前頁數
      if (req.query.page - 1) {
        offset = (req.query.page - 1) * allTweetsPageLimit
      }

      const result = await Tweet.findAndCountAll({
        include: [
          {
            model: Reply,
            // required: false,
            include: [
              {
                model: User,
                required: false
              }
            ]
          },
          {
            model: User,
            as: 'LikedUsers'
          },
          {
            model: User,
            where: { id: sequelize.col('tweet.UserId') }
          }
        ],
        order: [['id', 'ASC']],
        offset: offset,
        limit: allTweetsPageLimit,
        distinct: true // 這行是為了 result.count 正確，沒加會不正確

        /*
          Tweet.findAndCountAll 資料內容格式
          result: {
            count : 總筆數
            rows: [
              { tweet },
              { tweet },
              ...
            ]
          }
        */
      })

      // 分頁資料
      const page = Number(req.query.page || 1)
      const pages = Math.ceil(result.count / allTweetsPageLimit)
      const totalPage = Array.from({ length: pages }).map((item, index) => index + 1)
      const prev = page - 1 < 1 ? 1 : page - 1
      const next = page + 1 > pages ? pages : page + 1

      // console.log('')
      // console.log('')
      // console.log('')
      // console.log('')
      // console.log('total Count', result.count)
      // console.log('allTweetsPageLimit ', allTweetsPageLimit)
      // console.log('offset', offset)
      // console.log('page', page)
      // console.log('pages', pages)
      // console.log('totalPage', totalPage)
      // console.log('prev', prev)
      // console.log('next', next)
      // console.log('tweets ID Array', result.rows.map(r => r.id))

      let tweets = result.rows.map(r => ({
        ...r.dataValues,
        User: r.User.dataValues,
        Replies: r.Replies.map(reply => ({
          ...reply.dataValues,
          User: reply.User.dataValues
        })),
        LikedUsers: r.LikedUsers.map(user => ({
          ...user.dataValues
        })),
        likedCount: r.LikedUsers.length
      }))

      tweets = tweets.sort((a, b) =>
        b.likedCount - a.likedCount
      )

      // console.log('tweets[0]', tweets[0])

      return res.render('admin/tweets', { tweets, page, totalPage, prev, next })
    } catch (error) {
      console.log(error)
      req.flash('error_messages', { error_messages: '資料庫異常，請重新操作' })
      return res.redirect('back')
    }
  },

  deleteTweet: async (req, res) => {
    try {
      const tweet = await Tweet.findByPk(req.params.id)
      await tweet.destroy()
      return res.redirect('/admin')
    } catch (error) {
      console.log(error)
      req.flash('error_messages', { error_messages: '資料庫異常，請重新操作' })
      return res.redirect('back')
    }
  },

  getUsers: async (req, res) => {
    try {
      let offset = 0

      // 計算目前頁數
      if (req.query.page - 1) {
        offset = (req.query.page - 1) * allUsersPageLimit
      }

      const result = await User.findAndCountAll({
        include: [
          Tweet,
          { model: User, as: 'Followers' },
          { model: User, as: 'Followings' },
          { model: Tweet, as: 'LikedTweets' }
        ],
        // order: [['id', 'ASC']],
        offset: offset,
        limit: allUsersPageLimit,
        distinct: true // 這行是為了 result.count 正確，沒加會不正確
      })

      let users = result.rows.map(r => ({
        ...r.dataValues
      }))

      console.log('')
      console.log('')
      console.log('users', users)

      // 分頁資料
      const page = Number(req.query.page || 1)
      const pages = Math.ceil(result.count / allUsersPageLimit)
      const totalPage = Array.from({ length: pages }).map((item, index) => index + 1)
      const prev = page - 1 < 1 ? 1 : page - 1
      const next = page + 1 > pages ? pages : page + 1

      // 依發文數量排序，由多至少
      users = users.sort((a, b) => b.Tweets.length - a.Tweets.length)

      return res.render('admin/users', { users, page, totalPage, prev, next })
    } catch (error) {
      console.log(error)
      req.flash('error_messages', { error_messages: '資料庫異常，請重新操作' })
      return res.redirect('back')
    }
  }
}

module.exports = adminController
