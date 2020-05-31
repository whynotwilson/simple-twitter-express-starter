const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController')

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

router.get('/:id/tweets', authenticated, userController.getTweets)
router.get('/:id/followings', authenticated, userController.getFollowings)
router.get('/:id/followers', authenticated, userController.getFollowers)
router.get('/:id/likes', authenticated, userController.getLikes)
router.get('/:id/edit', authenticated, userController.getEdit)
router.post('/:id/edit', authenticated, upload.single('avatar'), userController.postEdit)

module.exports = router
