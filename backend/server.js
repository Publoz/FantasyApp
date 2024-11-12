import express from 'express';
const port = 3000;

import 'dotenv/config'
// dotenv from 'dotenv';
//dotenv.config();
import postgresql from './database.js'
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';

postgresql(async (connection) => {
  console.log("Chur");
});

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// app.use(function (req, res, next) {
//   res.header('Access-Control-Allow-Origin', process.env.PRODURL);
//   res.header('Access-Control-Allow-Credentials', true);
//   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//   next();
// });

//ROUTERS
//var authRouter = require('./routes/auth');
import authRouter from './routes/auth.js'
app.use('/auth', authRouter);


const requireAuth = (req, res, next) => {
  let tokenHeaderKey = process.env.TOKENHEADER;
  let jwtSecretKey = process.env.SECRET;

  try {
    const token = req.header(tokenHeaderKey);

    var verified = jwt.verify(token, jwtSecretKey, function(err, decoded){

      if(err) {
        return res.status(401).send(err);
      }
      req.user = decoded.user;
      return true;
    });
  
    if(verified) {
      next();
    } else {
      return res.status(401).send(error);
    }
  } catch (error) {
    // Access Denied
    return res.status(401).send(error);
  }
}

app.get('/testdb', async (req, res) => {
  console.log("Received test");
  const result = await process.postgresql.query(`Select * FROM Test`);
  console.log(result.rows);


  return res.json({ message: "Chur" });

});

app.get('/dashboard', requireAuth, (req, res) => {

  db.query(`Select * FROM Test`, (e, r)=> {
    if(!error){
        console.log(r.rows);
    } else {
        console.log(e.message);
    }
    client.end;
  });

  return res.json({ message: "LoggedIn" })
});




app.listen(port, () => console.log(`Newspaper API listening at http://localhost:${port}`));