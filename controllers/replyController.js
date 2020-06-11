const helpers = require("../_helpers");
const db = require("../models");
const Tweet = db.Tweet;
const User = db.User;
const Like = db.Like;
const Reply = db.Reply;

const replyController = {
  getReplies: (req, res) => {
    Tweet.findByPk(req.params.tweet_id, {
      include: [
        User,
        Like,
        { model: User, as: "LikedUsers" },
        { model: Reply, include: [User] },
      ],
    }).then((tweet) => {

      // 判斷是否 我有封鎖他 or 他有封鎖我
      if (req.user.Blockings.map(b => b.id).includes(tweet.UserId) ||
        req.user.Blockers.map(b => b.id).includes(tweet.UserId)) {
        return res.render('getBlockMessage')
      }

      tweet.dataValues.likesCount = tweet.Likes.length;
      tweet.dataValues.isLiked = tweet.LikedUsers.map((d) => d.id).includes(
        helpers.getUser(req).id
      );
      tweet.dataValues.replies = tweet.Replies.map(reply => ({
        ...reply.dataValues,
        User: reply.User.dataValues
      })).sort((a, b) => b.createdAt - a.createdAt);

      User.findByPk(tweet.UserId, {
        include: [
          { model: Tweet, include: [User, Reply, Like] },
          { model: User, as: "Followers" },
          { model: User, as: "Followings" },
          { model: Tweet, as: "LikedTweets" },
        ],
      }).then((user) => {
        const currentUserId = helpers.getUser(req).id

        user.dataValues.tweetsCount = user.Tweets.length;
        user.dataValues.followerCount = user.Followers.length;
        user.dataValues.followingCount = user.Followings.length;
        user.dataValues.likedTweetsCount = user.LikedTweets.length;
        user.dataValues.isFollowed = helpers
          .getUser(req)
          .Followings.map((d) => d.id)
          .includes(user.id);

        return res.render("tweetsReplies", {
          tweet: tweet.toJSON(),
          targetUser: user.toJSON(),
          currentUserId
        });
      });
    });
  },
  postReply: (req, res) => {
    const comments = req.body.comment.trim()

    if (comments.length === 0) {
      req.flash('error_messages', { error_messages: '輸入不可為空白！' })
      return res.redirect(`/tweets/${req.params.tweet_id}/replies`)
    } else {
      return Reply.create({
        comment: req.body.comment,
        UserId: helpers.getUser(req).id,
        TweetId: req.params.tweet_id
      }).then(reply => {
        return res.redirect(`/tweets/${req.params.tweet_id}/replies`)
      })
    }
  }
};

module.exports = replyController;
