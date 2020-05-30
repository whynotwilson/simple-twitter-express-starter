const userController = require('../controllers/userController')
const tweetsController = require('../controllers/tweetsController')

module.exports = (app) => {
  app.get('/signup', userController.signUpPage)
  app.post('/signup', userController.signUp)
  app.get('/signin', userController.signInPage)
  app.post('/signin', userController.signIn)

  // 導向首頁
  app.get('/', (req, res) => res.redirect('/tweets'))
  // 首頁
  app.get('/tweets', tweetsController.getTweets)
}
