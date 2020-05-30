const express = require('express');
const router = express.Router();
const userController = require('../controller/userController')

router.get('/', (req, res) => {
  res.send('hihii')
})
router.post('/followships/:userId', userController.addFollowing)
router.delete('/followships/:userId', userController.deleteFollowing)

module.exports = router