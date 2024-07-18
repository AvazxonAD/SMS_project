const express = require('express');
const app = express();
const exphbs = require('express-handlebars');
const path = require('path');
const flash = require('connect-flash');
const session = require('express-session');
const pool = require('./config/db');
const pgSession = require('connect-pg-simple')(session);

// Load environment variables
require('dotenv').config();

// Session configuration
app.use(session({
  store: new pgSession({
    pool: pool,
    tableName: 'sessions'
  }),
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days cookie expiration
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(flash());

// Handlebars setup
app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views')); // Ensure correct path resolution

// Custom middleware or initialization
require('./utils/create.user')();

// Routes
app.use('/auth', require('./routes/auth.route'));
app.use('/sms', require('./routes/sms.route'));

// Server start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
