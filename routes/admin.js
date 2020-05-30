const express = require('express')
const routes = express.Router()
const app = express()
const adminController = require('../controllers/adminController.js')
const multer = require('multer')
const upload = multer({ dest: 'temp/' })
const authenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect('/signin')
}
const authenticatedAdmin = (req, res, next) => {
  if (req.isAuthenticated()) {
    if (req.user.role) { return next() }
    return res.redirect('/')
  }
  res.redirect('/signin')
}

routes.get('/admin/tweets', authenticatedAdmin, adminController.getTweets)
routes.delete('/admin/tweets/:id', authenticatedAdmin, adminController.deleteRestaurant)
routes.get('/admin/users', authenticatedAdmin, (req, res) => res.redirect('/admin/users'))

module.exports = routes
