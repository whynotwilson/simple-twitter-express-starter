const userController = require('../controllers/userController')
const tweetsController = require('../controllers/tweetsController')
const adminController = require('../controllers/adminController')
const replyController = require('../controllers/replyController')
const passport = require('../config/passport')

// 上傳圖片
const multer = require('multer')
const upload = multer({
  dest: 'temp/'
})

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

  // 首頁
  app.get('/', authenticated, (req, res) => res.redirect('/tweets'))

  // users
  app.get('/users/:id/tweets', authenticated, userController.getTweets)
  app.get('/users/:id/followings', authenticated, userController.getFollowings)
  app.get('/users/:id/followers', authenticated, userController.getFollowers)
  app.get('/users/:id/likes', authenticated, userController.getLikes)
  app.get('/users/:id/edit', authenticated, userController.getEdit)
  app.post('/users/:id/edit', authenticated, upload.single('avatar'), userController.postEdit)

  app.post('/followships', authenticated, userController.addFollowing)
  app.delete('/followships/:userId', authenticated, userController.deleteFollowing)

  // signin / logout / signup
  app.get('/signup', userController.signUpPage)
  app.post('/signup', userController.signUp)
  app.get('/signin', userController.signInPage)
  app.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)
  app.get('/logout', userController.logout)

  // admin
  app.get('/admin', authenticatedAdmin, (req, res) => res.redirect('/admin/tweets'))
  app.get('/admin/tweets', authenticatedAdmin, adminController.getTweets)
  app.get('/admin/users', authenticatedAdmin, adminController.getUsers)
  app.delete('/admin/tweets/:id', authenticatedAdmin, adminController.deleteTweet)

  // tweets
  app.get('/tweets', authenticated, tweetsController.getTweets)
  app.post('/tweets', authenticated, tweetsController.postTweets)
  app.post('/tweets/:id/like', authenticated, tweetsController.addLike)
  app.post('/tweets/:id/unlike', authenticated, tweetsController.removeLike)
  app.get('/tweets/:tweet_id/replies', authenticated, replyController.getReplies)
  app.post('/tweets/:tweet_id/replies', authenticated, replyController.postReply)

  // chat
  app.get('/chat/:id', authenticated, (req, res) => {
    res.sendFile(process.cwd() + '/public/chatroom.html')
  })
}
