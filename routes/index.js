const userController = require('../controllers/userController')
const tweetsController = require('../controllers/tweetsController')

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

  app.use('/users', authenticated, require('./user'))
  app.post('/followships/:userId', authenticated, userController.addFollowing)
  app.delete('/followships/:userId', authenticated, userController.deleteFollowing)

  // 導向首頁
  app.get('/', authenticated, (req, res) => res.redirect('/tweets'))
  // 首頁
  app.get('/tweets', authenticated, tweetsController.getTweets)
  app.post('/tweets', authenticated, tweetsController.postTweets)
}
