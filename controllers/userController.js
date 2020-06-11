// 引入資料庫
const db = require('../models')
const User = db.User
const Tweet = db.Tweet
const Like = db.Like
const Reply = db.Reply
const Blockship = db.Blockship
const moment = require('moment')
const Followship = db.Followship
const bcrypt = require('bcryptjs')
const helpers = require("../_helpers")
const Op = require('sequelize').Op
const sequelize = require('sequelize')
const fs = require('fs')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const userController = {

  getTweets: async (req, res) => {
    try {
      const otherUserId = Number(req.params.id)
      let isOwner = false
      if (otherUserId === helpers.getUser(req).id) {
        isOwner = true
      }

      // 判斷是否 我有封鎖他 or 他有封鎖我
      if (req.user.Blockings.map(b => b.id).includes(otherUserId) ||
        req.user.Blockers.map(b => b.id).includes(otherUserId)) {
        return res.render('getBlockMessage')
      }

      let otherUser = await User.findByPk(otherUserId, {
        include: [
          { model: User, as: 'Followers' },
          { model: User, as: 'Followings' },
          { model: User, as: 'Blockers' },
          { model: User, as: 'Blockings' },
          Like
        ]
      })

      if (!otherUser) {
        throw new Error('otherUser is not found')
      }
      // ------------------ otherUser 資料整理 -------------------
      otherUser = {
        ...otherUser.toJSON(),
        introduction: otherUser.introduction.substring(0, 30),
        Followers: otherUser.Followers.map(follower => ({
          ...follower
        })),
        Blockers: otherUser.Blockers.map(blocker => ({
          ...blocker
        })),
        Blockings: otherUser.Blockings.map(blocking => ({
          ...blocking
        })),
        isFollowed: otherUser.Followers.map(d => d.id).includes(req.user.id)
      }


      let tweets = await Tweet.findAll({
        order: [["createdAt", "DESC"]],
        where: {
          UserId: otherUserId
        },
        include: [
          Like,
          { model: Reply, include: [User] },
          { model: User, as: 'LikedUsers' },
          {
            model: User,
            where: { id: sequelize.col('tweet.UserId') }
          },
        ]
      })

      // ------------------ Tweets 資料整理 -------------------
      tweets = JSON.parse(JSON.stringify(tweets)).map(tweet => ({
        ...tweet,
        User: tweet.User,
        Replies: tweet.Replies,
        LikedUsers: tweet.LikedUsers,
        isLiked: tweet.LikedUsers ? tweet.LikedUsers.map(d => d.id).includes(helpers.getUser(req).id) : false,
        description: tweet.description ? tweet.description : null,
        updatedAt: tweet.updatedAt ? moment(tweet.updatedAt).format('YYYY-MM-DD, hh:mm') : '-',
        likedCount: tweet.LikedUsers ? tweet.LikedUsers.length : 0
      }))

      return res.render('getTweets', { otherUser, tweets, isOwner })
    } catch (error) {
      console.log('error', error)
    }
  },

  getFollowings: async (req, res) => {
    try {
      const otherUserId = Number(req.params.id)

      let isOwner = false
      if (otherUserId === helpers.getUser(req).id) {
        isOwner = true
      }

      // 判斷是否 我有封鎖他 or 他有封鎖我
      if (req.user.Blockings.map(b => b.id).includes(otherUserId) ||
        req.user.Blockers.map(b => b.id).includes(otherUserId)) {
        return res.render('getBlockMessage')
      }

      let otherUser = await User.findByPk(otherUserId, {
        include: [
          { model: User, as: 'Followers' },
          { model: User, as: 'Followings' },
          Like,
          Tweet
        ]
      })

      if (!otherUser) {
        throw new Error('otherUser is not found')
      }
      // ------------------ otherUser 資料整理 -------------------
      otherUser = {
        ...otherUser.dataValues,
        introduction: otherUser.introduction.substring(0, 30),
        Followers: otherUser.Followers.map(follower => ({
          ...follower.dataValues
        })),
        Followings: otherUser.Followings.map(following => ({
          ...following.dataValues,
          introduction: following.introduction.substring(0, 30),
          isFollowing: req.user.Followings.map(f => f.id).includes(following.id)
        })),
        Tweet: otherUser.Tweets.map(tweet => ({
          ...tweet.dataValues
        })),
        isFollowing: otherUser.Followers.map(d => d.id).includes(req.user.id)
      }

      return res.render('getFollowings', { otherUser, followings: otherUser.Followings, isOwner })
    } catch (error) {
      console.log('error', error)
      req.flash('error_messages', { error_messages: '資料庫異常，請重新操作' })
      return res.redirect('back')
    }
  },

  getFollowers: async (req, res) => {
    try {
      const otherUserId = Number(req.params.id)

      let isOwner = false
      if (otherUserId === helpers.getUser(req).id) {
        isOwner = true
      }

      // 判斷是否 我有封鎖他 or 他有封鎖我
      if (req.user.Blockings.map(b => b.id).includes(otherUserId) ||
        req.user.Blockers.map(b => b.id).includes(otherUserId)) {
        return res.render('getBlockMessage')
      }

      let otherUser = await User.findByPk(otherUserId, {
        include: [
          { model: User, as: 'Followers' },
          { model: User, as: 'Followings' },
          Like,
          Tweet
        ]
      })

      if (!otherUser) {
        throw new Error('otherUser is not found')
      }
      // ------------------ otherUser 資料整理 -------------------
      otherUser = {
        ...otherUser.dataValues,
        introduction: otherUser.introduction.substring(0, 30),
        Followers: otherUser.Followers.map(follower => ({
          ...follower.dataValues,
          introduction: follower.introduction.substring(0, 30),
          isFollowing: req.user.Followings.map(f => f.id).includes(follower.id)
        })),
        Followings: otherUser.Followings.map(following => ({
          ...following.dataValues
        })),
        Tweet: otherUser.Tweets.map(tweet => ({
          ...tweet.dataValues
        })),
        isFollowing: otherUser.Followers.map(d => d.id).includes(req.user.id)
      }

      return res.render('getFollowers', { otherUser, followers: otherUser.Followers, isOwner })
    } catch (error) {
      console.log('error', error)
      req.flash('error_messages', { error_messages: '資料庫異常，請重新操作' })
      return res.redirect('back')
    }
  },

  getLikes: async (req, res) => {
    try {
      const otherUserId = Number(req.params.id)

      let isOwner = false
      if (otherUserId === helpers.getUser(req).id) {
        isOwner = true
      }

      // 判斷是否 我有封鎖他 or 他有封鎖我
      if (req.user.Blockings.map(b => b.id).includes(otherUserId) ||
        req.user.Blockers.map(b => b.id).includes(otherUserId)) {
        return res.render('getBlockMessage')
      }

      let otherUser = await User.findByPk(otherUserId, {
        include: [
          { model: User, as: 'Followers' },
          { model: User, as: 'Followings' },
          Like,
          Tweet
        ]
      })

      if (!otherUser) {
        throw new Error('otherUser is not found')
      }
      // ------------------ otherUser 資料整理 -------------------
      otherUser = {
        ...otherUser.dataValues,
        introduction: otherUser.introduction.substring(0, 30),
        Followers: otherUser.Followers.map(follower => ({
          ...follower.dataValues
        })),
        Followings: otherUser.Followings.map(following => ({
          ...following.dataValues
        })),
        Tweet: otherUser.Tweets.map(tweet => ({
          ...tweet.dataValues
        })),
        isFollowing: otherUser.Followers.map(d => d.id).includes(req.user.id)
      }

      const likedTweetsIdArr = otherUser.Likes.map(t => t.TweetId)
      console.log('')
      console.log('')
      console.log('')
      console.log('likedTweetsIdArr', likedTweetsIdArr)

      let likedTweets = await Tweet.findAll({
        where: {
          id: likedTweetsIdArr
        },
        include: [
          {
            model: User,
            where: { id: sequelize.col('tweet.UserId') }
          },
          Reply,
          Like
        ]
      })

      likedTweets = likedTweets.map(tweet => ({
        ...tweet.dataValues,
        User: tweet.User.dataValues,
        updatedAt: tweet.updatedAt
          ? moment(tweet.updatedAt).format('YYYY-MM-DD, hh:mm')
          : '-',
        repliesCount: tweet.Replies.length,
        likedCount: tweet.Likes.length,
        isLiked: req.user.LikedTweets.map(t => t.id).includes(tweet.id)
      }))

      console.log('likedTweets', likedTweets)

      return res.render('getLikes', { otherUser, likedTweets, isOwner })
    } catch (error) {
      console.log('error', error)
      req.flash('error_messages', { error_messages: '資料庫異常，請重新操作' })
      return res.redirect('back')
    }
  },

  addFollowing: async (req, res) => {
    try {
      if (Number(req.user.id) === Number(req.body.id)) {
        throw new Error('自己無法 follow 自己')
      }
      const findOne = await Followship.findOne({
        where: {
          [Op.and]: [
            { followerId: req.user.id },
            { followingId: req.body.id }
          ]
        }
      })
      if (!findOne) {
        await Followship.create({
          followerId: req.user.id,
          followingId: req.body.id
        })
      }
      return res.redirect('back')
    } catch (error) {
      console.log('error', error)
      req.flash('error_messages', { error_messages: '自己無法 Follow 自己' })
      return res.redirect('back')
    }
  },

  deleteFollowing: (req, res) => {

    Followship.findOne({
      where: {
        [Op.and]: [{ followerId: helpers.getUser(req).id }, { followingId: req.params.userId }]
      }
    }).then(followship => {

      if (!followship) {
        req.flash('error_messages', { error_messages: "資料庫錯誤" })
        return res.redirect('back')
      }

      Followship.destroy({
        where: {
          [Op.and]: [{ followerId: helpers.getUser(req).id }, { followingId: req.params.userId }]
        }
      }).then(followship => {
        return res.redirect('back')
      })

    }).catch((error) => {
      console.log('error', error)
      return res.redirect('back')
    })

  },

  getEdit: async (req, res) => {
    try {
      const userId = Number(req.params.id)
      //判斷是否為owner 不然退出
      if (userId === req.user.id) {
        const { dataValues } = (await User.findByPk(userId))
          ? await User.findByPk(userId)
          : null;

        if (!dataValues) {
          throw new Error("user is not found");
        }
        let user = {};
        user = { ...dataValues };

        return res.render("getEdit", { user });
      } else {
        return res.redirect('/')
      }

    } catch (error) {
      console.log("error", error);
    }
  },

  postEdit: async (req, res) => {
    try {
      if (!req.body.name) {
        req.flash('error_messages', { error_messages: "請至少輸入姓名" })
        return res.redirect('back')
      }

      const userId = req.params.id;

      const { file } = req;
      if (file) {
        imgur.setClientID(IMGUR_CLIENT_ID)
        // const data = fs.readFileSync(file.path);
        // const writeFile = fs.writeFileSync(`upload/${file.originalname}`, data);
        const uploadImage = await imgur.upload(file.path, async (err, image) => {
          try {
            const updateUser = await User.findByPk(userId).then((user) => {
              user.update({
                name: req.body.name,
                introduction: req.body.introduction,
                avatar: file ? image.data.link : null,
              });
            });
            req.flash('success_messages', "個人資料已成功修改")
            return res.redirect(`/users/${userId}/tweets`);
          } catch (error) {
            console.log('error', error)
          }

        })
      } else {
        const updateUser = await User.findByPk(userId).then((user) => {
          user.update({
            name: req.body.name,
            introduction: req.body.introduction,
            avatar: this.avatar,
          });
        });

        req.flash('success_messages', "個人資料已成功修改")
        return res.redirect(`/users/${userId}/tweets`);
      }
    } catch (error) {
      console.log("error", error);
    }
  },

  getBlockings: async (req, res) => {
    try {
      const otherUserId = Number(req.params.id)

      let isOwner = false
      if (otherUserId === helpers.getUser(req).id) {
        isOwner = true
      }

      // 判斷是否 我有封鎖他 or 他有封鎖我
      if (req.user.Blockings.map(b => b.id).includes(otherUserId) ||
        req.user.Blockers.map(b => b.id).includes(otherUserId)) {
        return res.render('getBlockMessage')
      }

      let otherUser = await User.findByPk(otherUserId, {
        include: [
          { model: User, as: 'Followers' },
          { model: User, as: 'Followings' },
          Like,
          Tweet
        ]
      })

      if (!otherUser) {
        throw new Error('otherUser is not found')
      }
      // ------------------ otherUser 資料整理 -------------------
      otherUser = {
        ...otherUser.dataValues,
        introduction: otherUser.introduction.substring(0, 30),
        Followers: otherUser.Followers.map(follower => ({
          ...follower.dataValues,
          introduction: follower.introduction.substring(0, 30),
          isFollowing: req.user.Followings.map(f => f.id).includes(follower.id)
        })),
        Followings: otherUser.Followings.map(following => ({
          ...following.dataValues
        })),
        Tweet: otherUser.Tweets.map(tweet => ({
          ...tweet.dataValues
        })),
        isFollowing: otherUser.Followers.map(d => d.id).includes(req.user.id)
      }

      // ------------------ blockings 資料整理 -------------------

      let blockings = await User.findByPk(req.user.id, {
        include: [{ model: User, as: 'Blockings' }]
      })

      blockings = blockings.dataValues.Blockings.map(blocking => ({
        ...blocking.dataValues,
        introduction: blocking.introduction.substring(0, 30)
      }))

      return res.render('getBlockings', { otherUser, isOwner, blockings })
    } catch (error) {
      console.log('error', error)
      req.flash('error_messages', { error_messages: '資料庫異常，請重新操作' })
      return res.redirect('back')
    }
  },

  postBlock: async (req, res) => {
    try {
      // 先找出封鎖者與被封鎖者有無 follow 關係
      // 有 => 先刪除 follow 關係再建立封鎖關係
      // 無 => 直接建立封鎖關係
      const myFollowers = req.user.Followers
      const myFollowings = req.user.Followings

      if (myFollowers.map(f => f.id).includes(Number(req.body.userId))) {
        await Followship.destroy({
          where: {
            [Op.and]: [
              { followerId: req.body.userId },
              { followingId: helpers.getUser(req).id }
            ]
          }
        })
      }

      if (myFollowings.map(f => f.id).includes(Number(req.body.userId))) {
        await Followship.destroy({
          where: {
            [Op.and]: [
              { followerId: helpers.getUser(req).id },
              { followingId: req.body.userId }
            ]
          }
        })
      }

      // 確認未封鎖
      const myBlockings = req.user.Blockings
      if (myBlockings.map(f => f.id).includes(Number(req.body.userId))) {
        req.flash('error_messages', { error_messages: '已在封鎖名單中' })
      } else {
        await Blockship.create({
          blockerId: req.user.id,
          blockingId: req.body.userId
        })
        req.flash('success_messages', '已成功封鎖該用戶')
      }

      return res.redirect(`/users/${req.user.id}/blockings`)
    } catch (error) {
      console.log(error)
      req.flash('error_messages', { error_messages: '資料庫異常，未能成功封鎖該用戶！' })
      return res.redirect('back')
    }
  },

  deleteBlock: async (req, res) => {
    try {
      const destroyBlock = await Blockship.findOne({
        where: {
          [Op.and]: [
            { blockerId: req.user.id },
            { blockingId: req.params.id }
          ]
        }
      })

      req.flash('success_messages', '成功解除封鎖該用戶')
      await destroyBlock.destroy()
      return res.redirect('back')
    } catch (error) {
      console.log(error)
      req.flash('error_messages', { error_messages: '資料庫異常，未能成功解除封鎖該用戶！' })
      return res.redirect('back')
    }
  },

  signUpPage: (req, res) => {
    return res.render("signup");
  },

  signUp: async (req, res) => {
    try {
      const error_messages = []

      if (req.body.passwordCheck !== req.body.password) {
        error_messages.push({ error_messages: '兩次密碼輸入不同！' })
      }

      if (!req.body.name || !req.body.password || !req.body.email || !req.body.passwordCheck) {
        error_messages.push({ error_messages: '請填寫所有欄位！' })
      }

      if (req.body.password.length < 8) {
        error_messages.push({ error_messages: '密碼至少 8 位數！' })
      }

      // confirm unique name
      let user = await User.findOne({ where: { name: req.body.name } })
      if (user) {
        error_messages.push({ error_messages: '暱稱重複！' })
      }

      // confirm unique user
      user = await User.findOne({ where: { email: req.body.email } })
      if (user) {
        error_messages.push({ error_messages: '信箱重複！' })
      }

      if (error_messages.length !== 0) {
        req.flash('error_messages', error_messages)
        return res.redirect("/signup");
      }

      await User.create({
        name: req.body.name,
        email: req.body.email,
        password: bcrypt.hashSync(
          req.body.password,
          bcrypt.genSaltSync(10),
          null
        ),
        introduction: '',
        role: 'user'
      })

      req.flash("success_messages", "成功註冊帳號！");
      return res.redirect("/signin");
    } catch (error) {
      console.log(error)
      req.flash('error_messages', { error_messages: '資料庫異常，註冊帳號失敗！' });
      return res.redirect("/signup");
    }
  },

  signInPage: (req, res) => {
    return res.render("signin");
  },

  signIn: (req, res) => {
    req.session.username = helpers.getUser(req).name
    req.session.avatar = helpers.getUser(req).avatar
    req.session.id = helpers.getUser(req).passport
    req.flash("success_messages", "成功登入！");
    res.redirect("/tweets");
  },

  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    res.redirect('/signin')
  }

}

module.exports = userController;
