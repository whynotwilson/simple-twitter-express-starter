const express = require('express')
const helpers = require('./_helpers')
const handlebars = require('express-handlebars')

const exphbs = require('express-handlebars')
const bodyParser = require('body-parser')
const flash = require('connect-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)

const sessionMiddleware = session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
})

io.use((socket, next) => {
  sessionMiddleware(socket.request, socket.request.res || {}, next)
})

const port = process.env.PORT || 3000
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const passport = require('./config/passport')

const db = require('./models')
const User = db.User
const { Op } = require('sequelize')

// use helpers.getUser(req) to replace helpers.getUser(req)
// use helpers.ensureAuthenticated(req) to replace req.isAuthenticated()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use('/upload', express.static(__dirname + '/upload'))
app.use(bodyParser.json())


app.engine('handlebars', handlebars({
  defaultLayout: 'main',
  helpers: require('./config/handlebars-helpers')
}))
app.set('view engine', 'handlebars')

app.use(sessionMiddleware)
app.use(flash())
app.use(express.static('public'))

app.use(passport.initialize())
app.use(passport.session())

app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  res.locals.user = helpers.getUser(req)
  user = helpers.getUser(req)
  next()
})

io.on('connection', (socket) => {
  console.log('a user connected')

  const currentUser = socket.request.session

  socket.on('send message', (chat) => {
    let chatRoomNum = `${chat.senderId ^ chat.receiverId}`

    socket.join(chatRoomNum)

    io.sockets.in(chatRoomNum).emit('chat message', {
      msg: chat.message,
      avatar: currentUser.avatar,
      name: currentUser.username,
      id: currentUser.passport.user,
      sendTime: helpers.fromNow(new Date())
    })
  })

  socket.on('test', (keyword) => {

    User.findAll({
      raw: true, nest: true, order: [['name', 'ASC']], where: {
        email: { [Op.like]: '%' + keyword + '%' }
        // name: { [Op.like]: '%' + keyword + '%' }
      }
    }).then((users) => {

      const searchedUsers = users.map(user => ({
        id: user.id,
        name: user.name,
        avatar: user.avatar
      }))

      io.emit('tag', { searchedUsers })
    })
  })

  socket.on('disconnect', () => {
    console.log('user disconnected')
  })
})

http.listen(port, () => console.log(`Example app listening on port ${port}!`))

// let io = require('socket.io').listen(app);
// io.sockets.on('connection', function(socket){

// })

require('./routes')(app)
module.exports = http
