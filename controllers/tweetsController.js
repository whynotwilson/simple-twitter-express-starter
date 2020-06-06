const db = require("../models");
const Tweet = db.Tweet;
const User = db.User;
const Like = db.Like;
const Reply = db.Reply;
const Blockship = db.Blockship;
const helpers = require("../_helpers");
const Op = require('Sequelize').Op;

const tweetController = {
  getTweets: async (req, res) => {

    let blockships = await Blockship.findAll({
      where: {
        [Op.or]: [
          { blockerId: req.user.id },
          { blockingId: req.user.id }
        ]
      }
    })

    blockships = blockships.map(blockship => ({
      ...blockship.dataValues
    }))

    // blockshipsIdArr = 封鎖我的人 && 我封鎖的人的 ID
    const blockshipsIdArr = []

    blockships.forEach(blockship => {
      if (blockship.blockerId !== req.user.id) {
        blockshipsIdArr.push(blockship.blockerId)
      }
      if (blockship.blockingId !== req.user.id) {
        blockshipsIdArr.push(blockship.blockingId)
      }
    })

    let tweets = await Tweet.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        User,
        Reply,
        { model: User, as: 'LikedUsers' }
      ]
    })

    tweets = tweets.map((tweet) => ({
      ...tweet.dataValues,
      description: tweet.description.substring(0, 100),
      isLiked: tweet.LikedUsers.map(d => d.id).includes(helpers.getUser(req).id),
      likedCount: tweet.LikedUsers.length,
      replyCount: tweet.Replies.length
    }))

    let count = 0

    tweets = tweets.filter(tweet => {
      return !(blockshipsIdArr.includes(tweet.User.id)) && count++ < 10
    })

    let users = await User.findAll({
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, as: 'Followers' }
      ]
    })

    users = users.map(user => ({
      ...user.dataValues,
      followersCount: user.Followers.length,
      isFollowed: helpers.getUser(req).Followings.map(d => d.id).includes(user.id)
    }))

    count = 0
    users = users.filter(user => {
      return !(blockshipsIdArr.includes(user.id)) && count++ < 10
    })

    users.sort((a, b) => b.followersCount - a.followersCount)

    return res.render('tweets', { tweets, users })
  },
  postTweets: (req, res) => {
    const tweetsDesc = req.body.tweets.trim();

    if (tweetsDesc !== "" && tweetsDesc.length <= 140) {
      Tweet.create({
        description: tweetsDesc,
        UserId: helpers.getUser(req).id,
      }).then((tweet) => {
        return res.redirect('/tweets')
      });
    } else {
      req.flash('error_messages', { error_messages: '輸入不可為空白！' });
      return res.redirect("/tweets");
    }
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
