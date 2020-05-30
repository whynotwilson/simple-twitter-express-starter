const db = require('../models')
const Tweet = db.Tweet
const User = db.User

const tweetController = {
  getTweets: (req, res) => {
    Tweet.findAll({
      raw: true,
      nest: true,
      limit: 10,
      order: [['createdAt', 'DESC']],
      include: [User]
    }).then(tweets => {

      tweets = tweets.map(tweet => ({
        ...tweet,
        description: tweet.description.substring(0, 100)
      }))

      console.log('tweets', tweets)

      User.findAll({
        raw: true,
        nest: true,
        limit: 10,
        order: [['createdAt', 'DESC']]
      }).then(users => {

        return res.render('tweets', {
          tweets,
          users
        })
      })
    })
  }
}

module.exports = tweetController