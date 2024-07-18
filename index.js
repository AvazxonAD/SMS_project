const express = require('express')
const app = express()

require('dotenv').config()
const exphbs = require('express-handlebars')
const path = require('path')
const flash = require('connect-flash')
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { Pool } = require('pg');
const pool = require('./config/db')

// const pool = new Pool({
//   connectionString: process.env.POSTGRES_URL,
//   ssl: {
//     rejectUnauthorized: false
//   }
// });

app.use(session({
  store: new pgSession({
    pool: pool,
    tableName: 'sessions'
  }),
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 kunlik cookie muddati
}));


app.use(express.json())
app.use(express.urlencoded({ extended: false }))


app.use(flash())

//Initialize template engine (handlebars)
app.engine('.hbs', exphbs.engine({ extname: '.hbs' }))
app.set('view engine', '.hbs')

require('./utils/create.user')()

app.use('/auth', require('./routes/auth.route'))
app.use('/sms', require('./routes/sms.route'))


const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`)
})
