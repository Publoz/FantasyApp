import express from 'express';
var router = express.Router();
import crypto from 'crypto';
import createDatabaseConnection from "../database.js";
import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRIDKEY);
import jwt from 'jsonwebtoken';


const db = createDatabaseConnection();

//SQL
const signUpSql = 'INSERT INTO Users (name, email, password, salt) VALUES ($1,$2,$3,$4) RETURNING UserId'
const loginSql = 'SELECT * FROM Users WHERE email ILIKE $1 LIMIT 1'
const insertTokenSql = 'INSERT INTO Tokens (UserId, Value) VALUES ($1,$2)'
const findTokenSql = 'SELECT * FROM Tokens WHERE Value = $1'
const verifyUserSql = 'UPDATE Users SET verified = TRUE WHERE userid = $1'
const updateTokenSql = 'UPDATE Tokens SET isRedeemed = TRUE WHERE userid = $1'

function validateSignUpDetails(req){
    if(!req.body.password || req.body.password.length <= 6){
        return 'Password too short';
    }
    if(!req.body.name){
        return 'Enter name';
    }
    if(!req.body.email || !isEmail(req.body.email)){
        return 'Enter Valid Email';
    }
    return null;
}

function isEmail(email) {
    var emailFormat = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    if (email !== '' && email.match(emailFormat)) { return true; }
    
    return false;
}

//Handle successful sign up in database
//Now we have email and user id we need to send verify email
//STEPS gen random string and save in tokens, send email with link
//user will click link and be verified
async function handleSuccessfulSignUp(res, email, userId){
    const randomString = crypto.randomBytes(32).toString("hex");

    var params = [userId, randomString];

    try {
        await db.query(insertTokenSql, params);
    } catch(err){
        console.log('Error inserting token: ' + err);
        return;
    }

    var link = process.env.PRODURL + '/auth/verify?token=' + randomString;
    var mailOptions = {
        from: {
            email: process.env.APPEMAIL,
            name: 'Handball Fantasy League'
        },
        to: email,
        subject: 'Welcome to Handball Fantasy League',
        text: 'Kia Ora, \n\nThank you for joining us in the Handball Fantasy League!\n\nPlease click the'
         + ' link to verify your account\n\n' + link +'\n\nCheers, PI20',
        trackingSettings: {
            clickTracking: {
                enable: false,
                enableText: false
            },
            openTracking: {
                enable: false
            }
        }
      };

      (async () => {
        try {
          await sgMail.send(mailOptions);
        } catch (error) {
          console.error(error);
      
          if (error.response) {
            console.error(error.response.body)
          }
        }
      })();
}


router.post('/signup', (req, res, next) => {
    let msg = validateSignUpDetails(req);
    if(msg !== null){
        return res.status(400).send(msg);
    }

    let salt = crypto.randomBytes(16);
    crypto.pbkdf2(req.body.password, salt, 310000, 32, 'sha256', async function(err, hashedPass){
        if(err){
            return res.status(500).send('Password gen failed');
        }
        
        var params = [req.body.name, req.body.email, hashedPass, salt];
        try {
            const userId = (await db.query(signUpSql, params)).rows[0]['userid'];
            handleSuccessfulSignUp(res, req.body.email, userId);
            res.json({
                "message" : userId
            })
    
        } catch (err){
            res.status(400).json({"error": err.message})
            return;
        }
    });
})
 router.get('/verify', async (req, res, next) => {
    if (!req.query.token){
        res.status(400).json({"error": 'Maybe you should try access this URL properly eh'})
        return;
    }
    var params = [req.query.token];
    try {
        const token = (await db.query(findTokenSql, params)).rows[0]
        
        if(!token){
            res.status(404).json({"error":'No token found, trash'});
            return;
        }

        if(token.isredeemed){
            res.status(400).json({"error":'This token has already been verified'});
            return;
        }

        var params = [token.userid];

        Promise.all([db.query(updateTokenSql, params), db.query(verifyUserSql, params)
        ]).then(function([query1Results, query2Results]){
            console.log("Success updating tokens");
            res.json({message: "User verified! (yeah I couldn't be bothered doing this page)."})
        }).catch(function(e){
            console.log("err " + e);
            res.status(500).json({"error":'Failed final steps of validating token'});
            return;
        })

    } catch (err){
        res.status(400).json({"error validating token ": err.message});
        return;
    }
})

router.post('/login', async (req, res, next) => {
    var params = [req.body.email];
    try {
        const result = await db.query(loginSql, params);
        const row = result.rows[0];
    
        if (!row) {
          return res.status(401).json({ "message": "Invalid username or password" });
        }
    
        console.log("Found User: ");
        console.log(row);
    
        crypto.pbkdf2(req.body.password, row.salt, 310000, 32, 'sha256', (err, hashedPass) => {
          if (err) {
            return res.status(500).send('Password gen failed');
          }
          if (!crypto.timingSafeEqual(row.password, hashedPass)) {
            return res.status(401).json({ "message": 'Invalid username or password' });
          }
    
          res.status(200).json({
            message: "Found user w/ pass",
            token: generateToken(row.email, row.userid)
          });
        });
      } catch (err) {
        console.error('Database query error', err);
        res.status(500).json({ "error": err.message });
      }
});
    


function generateToken(email, userId){
    let jwtSecretKey = process.env.SECRET;
    let data = {
        user: email,
        userId: userId
    };
 
    const token = jwt.sign(data, jwtSecretKey);

    return token;
}


// TODO: Do we need this?
router.get('/logout', async function(req, res, next) {
     return res.json({message: "Logged out"})
  });


export default router;