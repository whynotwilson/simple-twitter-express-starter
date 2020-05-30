const db = require("../models");
const Tweet = db.Tweet;
const User = db.User;
const helpers = require('../_helpers')

const tweetController = {
  getTweets: (req, res) => {
    Tweet.findAll({
      raw: true,
      nest: true,
      limit: 10,
      order: [["createdAt", "DESC"]],
      include: [User],
    }).then((tweets) => {
      tweets = tweets.map((tweet) => ({
        ...tweet,
        description: tweet.description.substring(0, 100),
      }));

      User.findAll({
        raw: true,
        nest: true,
        limit: 10,
        order: [["createdAt", "DESC"]],
      }).then((users) => {
        return res.render("tweets", {
          tweets,
          users,
        });
      });
    });
  },
  postTweets: (req, res) => {
    const tweetsDesc = req.body.tweets.trim()

    if (tweetsDesc !== "" && tweetsDesc.length <= 140) {
      Tweet.create({
        description: tweetsDesc,
        UserId: helpers.getUser(req).id
      }).then((tweet) => {
        return res.redirect('/tweets')
      });
    } else {
      req.flash("error_msg", "輸入不可為空白！");
      return res.redirect("/tweets");
    }
  }
};

module.exports = tweetController;
