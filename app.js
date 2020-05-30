const express = require('express')
const helpers = require('./_helpers');

const app = express()
const port = 3000

const exphbs = require('express-handlebars')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
// const flash = require('connect-flash')

app.engine('handlebars', exphbs({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')
// use helpers.getUser(req) to replace req.user
// use helpers.ensureAuthenticated(req) to replace req.isAuthenticated()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use('/upload', express.static(__dirname + '/upload'))
// app.use(flash())

// app.use((req, res, next) => {
//   res.locals.success_msg = req.flash('sucess_msg')
//   res.locals.warning_msg = req.flash('warning_msg')
//   next()
// })

app.use('/users', require('./routes/user'))
app.use('/', require('./routes/home'))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

module.exports = app
