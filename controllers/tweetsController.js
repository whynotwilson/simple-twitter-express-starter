const db = require("../models");
const Tweet = db.Tweet;
const User = db.User;
const Like = db.Like;
const Reply = db.Reply;
const Tag = db.Tag;
const Blockship = db.Blockship;
const helpers = require("../_helpers");
const Op = require('Sequelize').Op;

const tweetController = {
  getTweets: async (req, res) => {

    let blockships = await Blockship.findAll({
      raw: true,
      nest: true,
      where: {
        [Op.or]: [
          { blockerId: helpers.getUser(req).id },
          { blockingId: helpers.getUser(req).id }
        ]
      }
    })

    blockships = blockships.map(blockship => ({
      ...blockship.dataValues
    }))

    // blockshipsIdArr = 封鎖我的人 && 我封鎖的人的 ID
    const blockshipsIdArr = []

    blockships.forEach(blockship => {
      if (blockship.blockerId !== helpers.getUser(req).id) {
        blockshipsIdArr.push(blockship.blockerId)
      }
      if (blockship.blockingId !== helpers.getUser(req).id) {
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

    tweets = JSON.parse(JSON.stringify(tweets)).map((tweet) => ({
        ...tweet,
        User: tweet.User,
        description: tweet.description,
        isLiked: tweet.LikedUsers ? tweet.LikedUsers.map(d => d.id).includes(helpers.getUser(req).id) : false,
        likedCount: tweet.LikedUsers ? tweet.LikedUsers.length : 0,
        replyCount: tweet.Replies ? tweet.Replies.length : 0
      }))

    let count = 0

    tweets = tweets.filter(tweet => {
      return !(blockshipsIdArr.includes(tweet.User.id)) && count++ < 10
    })

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

      if (req.body.taggedId) {
        Tweet.create({
          description: tweetsDesc,
          UserId: helpers.getUser(req).id,
        }).then((tweet) => {
          if (typeof (req.body.taggedId) === 'string') {
            Tag.create({
              TaggedUserId: Number(req.body.taggedId),
              TweetId: tweet.id
            })
          } else {
            req.body.taggedId.forEach((id) => {
              Tag.create({
                TaggedUserId: Number(id),
                TweetId: tweet.id
              })
            })

          }
          return tweet

        }).then((tweet) => {
          return res.redirect('/tweets')
        })
      } else {
        Tweet.create({
          description: tweetsDesc,
          UserId: helpers.getUser(req).id,
        }).then((tweet) => {
          return res.redirect('/tweets')
        });
      }


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
