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
if(process.env.ISPROD + '' === '1'){
  app.use(enforce.HTTPS({ trustProtoHeader: true }));
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
  store: new SQLiteStore(),
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: (process.env.ISPROD + '' === '1') }
}));


app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', process.env.PRODURL);
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

//ROUTERS
var authRouter = require('./routes/auth');
app.use('/auth', authRouter);


const requireAuth = (req, res, next) => {
  var message = "";
  if (!req.session.userId) {
      message += "No user Id - ";
  } 
  if(!req.session.verified){
    message += " verified no exists -";
  }
  if(req.session.verified !== 1){
    message += " Not 1 - " + req.session.verified;
  }
  if(message !== ''){
    return res.json({message: message})
  }
  
  next();
}


app.get('/dashboard', requireAuth, (req, res) => {
  return res.json({message: "LoggedIn"})
});




app.listen(port, () => console.log(`Newspaper API listening at http://localhost:${port}`));