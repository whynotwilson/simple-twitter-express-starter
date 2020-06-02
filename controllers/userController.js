// 引入資料庫
const db = require('../models')
const User = db.User
const Tweet = db.Tweet
const Like = db.Like
const Reply = db.Reply
const moment = require('moment')
const Followship = db.Followship
const bcrypt = require('bcryptjs')
const helpers = require("../_helpers");

const fs = require('fs')

const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID


const userController = {

  getTweets: async (req, res) => {
    try {

      const userId = Number(req.params.id)
      let isOwner = userId === req.user.id ? true : false;

      const { dataValues } = await User.findByPk(userId) ? await User.findByPk(userId, {
        include: [
          { model: User, as: 'Followers' },
          { model: User, as: 'Followings' },
          { model: Tweet, include: [Like, Reply, { model: User, as: 'LikedUsers' }] },
          Like,
          Reply
        ]
      }) : null

      if (!dataValues) {
        throw new Error("user is not found");
      }
      let userData = {}
      userData = {
        ...dataValues, introduction: dataValues.introduction ? dataValues.introduction.substring(0, 30) : null,
        isFollowing: req.user.Followings.map(d => d.id).includes(userId)
      }

      const tweets = dataValues.Tweets.map(tweet => ({
        ...tweet,
        description: tweet.description
          ? tweet.description.substring(0, 50)
          : null,
        updatedAt: tweet.updatedAt
          ? moment(tweet.updatedAt).format(`YYYY-MM-DD, hh:mm`)
          : "-",
        isLiked: tweet.LikedUsers.map(d => d.id).includes(helpers.getUser(req).id),
        likedCount: tweet.LikedUsers.length,
      }));

      return res.render('getTweets', { userData, tweets, isOwner })
    } catch (error) {
      console.log("error", error);
    }
  },
  getFollowings: async (req, res) => {
    try {

      const userId = Number(req.params.id)
      let isOwner = userId === req.user.id ? true : false;

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
        throw new Error("user is not found");
      }
      let userData = {}
      userData = {
        ...dataValues, introduction: dataValues.introduction ? dataValues.introduction.substring(0, 30) : null,
        isFollowing: req.user.Followings.map(d => d.id).includes(userId)
      }


      const followings = dataValues.Followings.map(following => ({
        ...following.dataValues,
        introduction: following.introduction ? following.introduction.substring(0, 20) : null,
      }))

      return res.render('getFollowings', { userData, followings: followings, isOwner })
    } catch (error) {
      console.log("error", error);
    }
  },
  getFollowers: async (req, res) => {
    try {

      const userId = Number(req.params.id)
      let isOwner = userId === req.user.id ? true : false;
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
        throw new Error("user is not found");
      }
      let userData = {}
      userData = {
        ...dataValues, introduction: dataValues.introduction ? dataValues.introduction.substring(0, 30) : null,
        isFollowing: req.user.Followings.map(d => d.id).includes(userId)
      }

      const followers = dataValues.Followers.map(follower => ({
        ...follower.dataValues,
        introduction: follower.introduction ? follower.introduction.substring(0, 20) : null,
        isOwnFollower: follower.dataValues.id === req.user.id ? true : false
      }))

      return res.render('getFollowers', { userData, followers: followers, isOwner })
    } catch (error) {
      console.log("error", error);
    }
  },
  getLikes: async (req, res) => {
    try {

      const userId = Number(req.params.id)
      let isOwner = userId === req.user.id ? true : false;
      const { dataValues } = await User.findByPk(userId) ? await User.findByPk(userId, {
        include: [
          { model: User, as: 'Followers' },
          { model: User, as: 'Followings' },
          { model: Like, include: [{ model: Tweet, include: [Like, Reply, User, { model: User, as: 'LikedUsers' }] }] },
          Reply,
          Tweet
        ]
      }) : null

      if (!dataValues) {
        throw new Error("user is not found");
      }

      let userData = {}
      userData = { ...dataValues, introduction: dataValues.introduction ? dataValues.introduction.substring(0, 30) : null, isFollowing: req.user.Followings.map(d => d.id).includes(userId) }

      let tweetsData = {}
      tweetsData = dataValues.Likes.map(d =>
        d.dataValues.Tweet
      )
      const tweets = tweetsData.map(tweet => ({
        ...tweet,
        description: tweet.description
          ? tweet.description.substring(0, 50)
          : null,
        updatedAt: tweet.updatedAt
          ? moment(tweet.updatedAt).format(`YYYY-MM-DD, hh:mm`)
          : "-",
        isLiked: tweet.LikedUsers.map(d => d.id).includes(helpers.getUser(req).id),
        likedCount: tweet.LikedUsers.length
      }));
      console.log(tweets)
      return res.render('getLikes', { userData, tweets, isOwner })
    } catch (error) {
      console.log("error", error);
    }
  },
  addFollowing: async (req, res) => {
    try {
      const newFollow = await Followship.create({
        followerId: req.user.id,
        followingId: req.params.userId,
      });

      return res.redirect("back");
    } catch (error) {
      console.log("error", error);
    }
  },
  deleteFollowing: async (req, res) => {
    try {
      const destroyFollow = await Followship.findOne({
        where: {
          followerId: req.user.id,
          followingId: req.params.userId,
        },
      }).then((followship) => {
        followship.destroy()
      })
      return res.redirect('back')

    } catch (error) {
      console.log("error", error);
    }
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
      })

      req.flash("success_messages", "成功註冊帳號！");
      return res.redirect("/signin");
    } catch (error) {
      console.log(error)
      req.flash('success_messages', { error_messages: '資料庫異常，註冊帳號失敗！' });
      return res.redirect("/signup");
    }
  },

  signInPage: (req, res) => {
    return res.render("signin");
  },

  signIn: (req, res) => {
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
