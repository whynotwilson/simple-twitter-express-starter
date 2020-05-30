const express = require('express');
const router = express.Router();
const userController = require('../controller/userController')


router.get('/:id/tweets', userController.getTweets)
router.get('/:id/followings', userController.getFollowings)
router.get('/:id/followers', userController.getFollowers)
router.get('/:id/likes', userController.getLikes)

module.exports = router