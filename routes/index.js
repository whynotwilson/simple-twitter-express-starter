const userController = require('../controllers/userController')
const tweetsController = require('../controllers/tweetsController')
const replyController = require('../controllers/replyController')
const passport = require('../config/passport')

const authenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect('/signin')
}

module.exports = (app) => {
  app.get('/signup', userController.signUpPage)
  app.post('/signup', userController.signUp)
  app.get('/signin', userController.signInPage)
  app.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)
  app.get('/logout', userController.logout)

  app.use('/users', authenticated, require('./user'))
  app.post('/followships/:userId', authenticated, userController.addFollowing)
  app.delete('/followships/:userId', authenticated, userController.deleteFollowing)

  // 導向首頁
  app.get('/', (req, res) => res.redirect('/tweets'))
  // 首頁
  app.get('/tweets', authenticated, tweetsController.getTweets)
  app.post('/tweets', authenticated, tweetsController.postTweets)
  app.post('/tweets/:id/like', authenticated, tweetsController.addLike)
  app.post('/tweets/:id/unlike', authenticated, tweetsController.removeLike)

  app.get('/tweets/:tweet_id/replies', authenticated, replyController.getReplies)
  app.post('/tweets/:tweet_id/replies', authenticated, replyController.postReply)
}
