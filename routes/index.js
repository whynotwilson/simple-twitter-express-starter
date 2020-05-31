const userController = require('../controllers/userController')
const tweetsController = require('../controllers/tweetsController')
const adminController = require('../controllers/adminController')
const passport = require('../config/passport')

const authenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect('/signin')
}

const authenticatedAdmin = (req, res, next) => {
  if (req.isAuthenticated()) {
    if (req.user.role) { return next() }
    return next()
    // return res.redirect('/admin/tweets')
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

  app.get('/admin', authenticatedAdmin, (req, res) => res.redirect('/admin/tweets'))
  app.get('/admin/tweets', authenticatedAdmin, adminController.getTweets)
  app.get('/admin/users', authenticatedAdmin, adminController.getUsers)
  app.delete('/admin/tweets/:id', authenticatedAdmin, adminController.deleteTweet)

  // 導向首頁
  app.get('/', (req, res) => res.redirect('/tweets'))
  // 首頁
  app.get('/tweets', authenticated, tweetsController.getTweets)
  app.post('/tweets', authenticated, tweetsController.postTweets)
}
