const userController = require('../controllers/userController')
const tweetsController = require('../controllers/tweetsController')

module.exports = (app) => {
  app.get('/signup', userController.signUpPage)
  app.get('/signin', userController.signInPage)

  // 導向首頁
  app.get('/', (req, res) => res.redirect('/tweets'))
  // 首頁
  app.get('/tweets', tweetsController.getTweets)
}