const express = require('express')
require('dotenv').config()
const exphbs = require('express-handlebars')
const path = require('path')
const flash = require('connect-flash')
const session = require('express-session') 

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// Sessiyalarni sozlash
app.use(session({
    secret: process.env.SECRET_KEY, 
    resave: false,
    saveUninitialized: false
}))

app.use(flash())

//Initialize template engine (handlebars)
app.engine('.hbs', exphbs.engine({ extname: '.hbs' }))
app.set('view engine', '.hbs')

app.use(express.static(path.join(__dirname, 'public')))

require('./utils/create.user')()

app.use('/auth', require('./routes/auth.route'))
app.use('/sms', require('./routes/sms.route'))


const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`)
})
