const db = require("../models");
const Tweet = db.Tweet;
const User = db.User;
const Like = db.Like;
const Reply = db.Reply;
const helpers = require("../_helpers");

const tweetController = {
  getTweets: (req, res) => {
    Tweet.findAll({
      limit: 10,
      order: [["createdAt", "DESC"]],
      include: [
        User,
        Reply,
        { model: User, as: 'LikedUsers' }
      ],
    }).then((tweets) => {
      tweets = tweets.map((tweet) => ({
        ...tweet.dataValues,
        description: tweet.description.substring(0, 100),
        isLiked: tweet.LikedUsers.map(d => d.id).includes(helpers.getUser(req).id),
        likedCount: tweet.LikedUsers.length,
        replyCount: tweet.Replies.length
      }));

      User.findAll({
        limit: 10,
        order: [["createdAt", "DESC"]],
        include: [
          { model: User, as: 'Followers' }
        ]
      }).then((users) => {
        users = users.map(user => ({
          ...user.dataValues,
          followersCount: user.Followers.length,
          isFollowed: helpers.getUser(req).Followings.map(d => d.id).includes(user.id)
        }))

        users.sort((a, b) => b.followersCount - a.followersCount)

        return res.render("tweets", {
          tweets,
          users,
        });
      });
    });
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
      req.flash('error_messages', "輸入不可為空白！");
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
