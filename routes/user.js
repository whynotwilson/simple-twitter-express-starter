const express = require('express')
const app = express()
const router = express.Router()
const userController = require('../controllers/userController.js')

// 上傳圖片
const multer = require('multer')
const upload = multer({
  dest: 'temp/'
})

router.get('/:id/tweets', userController.getTweets)
router.get('/:id/followings', userController.getFollowings)
router.get('/:id/followers', userController.getFollowers)
router.get('/:id/likes', userController.getLikes)
router.get('/:id/edit', userController.getEdit)
router.post('/:id/edit', upload.single('avatar'), userController.postEdit)
}
