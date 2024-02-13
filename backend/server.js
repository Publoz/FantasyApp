const express = require('express');
const app = express();
const port = 3000;

//MODULES
var db = require("./database.js")
var bodyParser = require('body-parser');
var enforce = require('express-sslify');
const session = require('express-session');
require('dotenv').config()
var SQLiteStore = require('connect-sqlite3')(session);


//APP USE
//app.use(enforce.HTTPS({ trustProtoHeader: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
  store: new SQLiteStore(),
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));


//ROUTERS
var authRouter = require('./routes/auth');
app.use('/auth', authRouter);


const requireAuth = (req, res, next) => {
  if (req.session.userId && req.session.verified && req.session.verified === '1') {
      next(); // User is authenticated, continue to next middleware
  } else {
      return res.json({message: "Not authenticated or not verified"})
      //res.redirect('/auth/login'); // User is not authenticated, redirect to login page
  }
}

app.get('/dashboard', requireAuth, (req, res) => {
  return res.json({message: "LoggedIn"})
});




app.listen(port, () => console.log(`Newspaper API listening at http://localhost:${port}`));