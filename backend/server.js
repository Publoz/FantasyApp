const express = require('express');
const app = express();
const port = 3000;

//MODULES
var db = require("./database.js")
var bodyParser = require('body-parser');
require('dotenv').config()
const jwt = require('jsonwebtoken');



app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// app.use(function (req, res, next) {
//   res.header('Access-Control-Allow-Origin', process.env.PRODURL);
//   res.header('Access-Control-Allow-Credentials', true);
//   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//   next();
// });

//ROUTERS
var authRouter = require('./routes/auth');
app.use('/auth', authRouter);


const requireAuth = (req, res, next) => {
  let tokenHeaderKey = process.env.TOKENHEADER;
  let jwtSecretKey = process.env.SECRET;

  try {
    const token = req.header(tokenHeaderKey);

    const verified = jwt.verify(token, jwtSecretKey);
    if (verified) {
      next();
    } else {
      // Access Denied
      return res.status(401).send(error);
    }
  } catch (error) {
    // Access Denied
    return res.status(401).send(error);
  }
}


app.get('/dashboard', requireAuth, (req, res) => {
  return res.json({ message: "LoggedIn" })
});




app.listen(port, () => console.log(`Newspaper API listening at http://localhost:${port}`));