const express = require('express');
const router = express.Router();
const userController = require('../controller/userController')


router.post('/followships/:userId', userController.addFollowing)
router.delete('/followships/:userId', userController.deleteFollowing)

module.exports = router