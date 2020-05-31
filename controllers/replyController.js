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
      tweet.dataValues.likesCount = tweet.Likes.length;
      tweet.dataValues.isLiked = tweet.LikedUsers.map((d) => d.id).includes(
        helpers.getUser(req).id
      );
      tweet.dataValues.replies = tweet.Replies.sort((a, b) => b.createdAt - a.createdAt);

      User.findByPk(tweet.UserId, {
        include: [
          { model: Tweet, include: [User, Reply, Like] },
          { model: User, as: "Followers" },
          { model: User, as: "Followings" },
          { model: Tweet, as: "LikedTweets" },
        ],
      }).then((user) => {
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
        });
      });
    });
  },
};

module.exports = replyController;
