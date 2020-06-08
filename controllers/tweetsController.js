const db = require("../models");
const Tweet = db.Tweet;
const User = db.User;
const Like = db.Like;
const Reply = db.Reply;
const Tag = db.Tag;
const Blockship = db.Blockship;
const helpers = require("../_helpers");
const Op = require('sequelize').Op;

const tweetController = {
  getTweets: async (req, res) => {

    /* Henry 做法 */
    // let blockships = await Blockship.findAll({
    //   raw: true,
    //   nest: true,
    //   where: {
    //     [Op.or]: [
    //       { blockerId: helpers.getUser(req).id },
    //       { blockingId: helpers.getUser(req).id }
    //     ]
    //   }
    // })

    // blockships = blockships.map(blockship => ({
    //   ...blockship.dataValues
    // }))

    // blockshipsIdArr = 封鎖我的人&& 我封鎖的人的ID
    // const blockshipsIdArr = []

    // blockships.forEach(blockship => {
    //   if (blockship.blockerId !== helpers.getUser(req).id) {
    //     blockshipsIdArr.push(blockship.blockerId)
    //   }
    //   if (blockship.blockingId !== helpers.getUser(req).id) {
    //     blockshipsIdArr.push(blockship.blockingId)
    //   }
    // })

    let tweets = await Tweet.findAll({
      limit: 10,
      order: [["createdAt", "DESC"]],
      include: [
        { model: User },
        Reply,
        { model: User, as: 'LikedUsers' }
      ]
    })

    tweets = JSON.parse(JSON.stringify(tweets)).map((tweet) => ({
      ...tweet,
      User: JSON.parse(JSON.stringify(tweet.User)),
      description: tweet.description,
      isLiked: tweet.LikedUsers ? tweet.LikedUsers.map(d => d.id).includes(helpers.getUser(req).id) : false,
      likedCount: tweet.LikedUsers ? tweet.LikedUsers.length : 0,
      replyCount: tweet.Replies ? tweet.Replies.length : 0
    }))

    console.log('')
    console.log('')
    console.log('')
    console.log('tweets[0]', tweets[0])

    // 擋掉封鎖的人的動態
    // let count = 0
    // tweets = tweets.filter(tweet => {
    //   return (!(req.user.Blockings.map(b => b.id).includes(tweet.User.id)) ||
    //     !(req.user.Blockers.map(b => b.id).includes(tweet.User.id))) &&
    //     count++ < 10
    // })

    // console.log('req.user.Blockings', req.user.Blockings.map(b => b.id))
    // console.log('req.user.Blockers', req.user.Blockers.map(b => b.id))

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

    // 擋掉封鎖的人的動態
    // count = 0
    // users = users.filter(user => {
    //   return !(req.user.Blockings.includes(user.id)) && !(req.user.Blockers.includes(user.id)) && count++ < 10
    // })

    users.sort((a, b) => b.followersCount - a.followersCount)

    return res.render('tweets', { tweets, users })

    /* 取不到 tweets[0].User User 會是 null

    // let blockships = await Blockship.findAll({
    //   where: {
    //     [Op.or]: [
    //       { blockerId: req.user.id },
    //       { blockingId: req.user.id }
    //     ]
    //   }
    // })

    // blockships = blockships.map(blockship => ({
    //   ...blockship.dataValues
    // }))

    // blockshipsIdArr = 封鎖我的人 && 我封鎖的人的 ID
    // const blockshipsIdArr = []

    // blockships.forEach(blockship => {
    //   if (blockship.blockerId !== req.user.id) {
    //     blockshipsIdArr.push(blockship.blockerId)
    //   }
    //   if (blockship.blockingId !== req.user.id) {
    //     blockshipsIdArr.push(blockship.blockingId)
    //   }
    // })

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
      // User: tweet.User.dataValues,
      description: tweet.description,
      isLiked: req.user.LikedTweets.map(d => d.id).includes(tweet.id),
      // isLiked: tweet.LikedUsers.map(d => d.id).includes(helpers.getUser(req).id),
      likedCount: tweet.LikedUsers.length,
      replyCount: tweet.Replies.length
    }))

    // 擋掉封鎖的人的動態
    let count = 0
    tweets = tweets.filter(tweet => {
      return !(blockshipsIdArr.includes(tweet.User.dataValues.id)) && count++ < 10
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

    // 擋掉封鎖的人的動態
    count = 0
    users = users.filter(user => {
      return !(req.user.Blockings.includes(user.id)) && !(req.user.Blockers.includes(user.id)) && count++ < 10
    })

    users.sort((a, b) => b.followersCount - a.followersCount)

    return res.render('tweets', { tweets, users })
  */
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
