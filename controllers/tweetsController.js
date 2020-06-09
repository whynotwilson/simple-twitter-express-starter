const db = require("../models");
const Tweet = db.Tweet;
const User = db.User;
const Like = db.Like;
const Reply = db.Reply;
const Tag = db.Tag;
const Blockship = db.Blockship;
const helpers = require("../_helpers");
const sequelize = require('sequelize');
const Op = require('sequelize').Op;

const tweetController = {
  getTweets: async (req, res) => {

    let tweets = await Tweet.findAll({
      limit: 50,
      order: [['createdAt', 'DESC']],
      include: [
        Reply,
        { model: User, as: 'LikedUsers' },
        User
      ]
    })

    tweets = tweets.map((tweet) => ({
      ...tweet.dataValues,
      User: tweet.User.dataValues,
      description: tweet.description,
      isLiked: tweet.LikedUsers.map(d => d.id).includes(helpers.getUser(req).id),
      likedCount: tweet.LikedUsers.length,
      replyCount: tweet.Replies.length
    }))

    // 擋掉封鎖的人的 tweets
    /*let count = 0
    tweets = tweets.filter(tweet => {
      return !req.user.Blockings.map(b => b.id).includes(tweet.User.id) &&
        !req.user.Blockers.map(b => b.id).includes(tweet.User.id) &&
        count++ < 10
    })*/

    let users = await User.findAll({
      raw: true,
      nest: true,
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, as: 'Followers' }
      ]
    })

    users = users.map(user => ({
      ...user,
      followersCount: user.Followers.length,
      isFollowed: helpers.getUser(req).Followings.map(d => d.id).includes(user.id)
    }))

    // 擋掉封鎖的人的 Popular User 頁面
    /*count = 0
    users = users.filter(user => {
      return !req.user.Blockings.map(b => b.id).includes(user.id) &&
        !req.user.Blockers.map(b => b.id).includes(user.id) &&
        count++ < 10
    })*/

    users.sort((a, b) => b.followersCount - a.followersCount)

    return res.render('tweets', { tweets, users })
  },

  postTweets: async (req, res) => {

    const description = req.body.description
    if (!req.body.description) {
      req.flash('error_messages', '輸入不可為空白！')
      return res.redirect('back')
    } else if (description.length > 140) {
      req.flash('error_messages', '最多 140 字！')
      return res.redirect('back')
    }
    try {
      await Tweet.create({
        description,
        UserId: helpers.getUser(req).id
      })
      return res.redirect('/tweets')
    } catch (error) {
      console.error(error)
      req.flash('error_messages', { messages: '新增 Tweets 失敗，請稍後嘗試！' })
      return res.redirect('back')
    }
    // if (tweetsDesc !== "" && tweetsDesc.length <= 140) {
    //   Tweet.create({
    //     description: tweetsDesc,
    //     UserId: helpers.getUser(req).id,
    //   }).then((tweet) => {
    //     return res.redirect('/')
    //   });

    // } else {
    //   req.flash('error_messages', { error_messages: '輸入不可為空白！' });
    //   return res.redirect("/tweets");
    // }
  },
  addLike: (req, res) => {
    return Like.create({
      UserId: helpers.getUser(req).id,
      TweetId: req.params.id
    }).then(like => {
      return res.redirect('back')
    })
  },
  removeLike: (req, res) => {
    Like.findOne({
      where: {
        UserId: helpers.getUser(req).id,
        TweetId: req.params.id
      }
    }).then(like => {
      like.destroy()
        .then(like => {
          return res.redirect('back')
        })
    })
  }
};

module.exports = tweetController;
