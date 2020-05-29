const express = require('express')
const helpers = require('./_helpers');

const app = express()
const port = 3000

const exphbs = require('express-handlebars')

app.engine('handlebars', exphbs({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')
// use helpers.getUser(req) to replace req.user
// use helpers.ensureAuthenticated(req) to replace req.isAuthenticated()

app.use('/users', require('./routes/user'))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

module.exports = app
