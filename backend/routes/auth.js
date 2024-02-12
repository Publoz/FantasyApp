var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var db = require("../database.js")

//SQL
const signUpSql = 'INSERT INTO Users (name, email, password, salt) VALUES (?,?,?,?)'
const loginSql = 'SELECT * FROM Users WHERE email = ? LIMIT 1'

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
    return '';
}

function isEmail(email) {
    var emailFormat = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    if (email !== '' && email.match(emailFormat)) { return true; }
    
    return false;
}


router.post('/signup', (req, res, next) => {
    let msg = validateSignUpDetails(req);
    if(msg != ''){
        return res.status(400).send(msg);
    }

    let salt = crypto.randomBytes(16);
    crypto.pbkdf2(req.body.password, salt, 310000, 32, 'sha256', async function(err, hashedPass){
        if(err){
            return res.status(500).send('Password gen failed');
        }
        
        var params = [req.body.name, req.body.email, hashedPass, salt];
        db.run(signUpSql, params, function(err, result){
            if (err){
                res.status(400).json({"error": err.message})
                return;
            }
            res.json({
                "message" : this.lastID
            })
        });
    });
})

router.post('/login', (req, res, next) => {
    var params = [req.body.email];
    db.get(loginSql, params, (err, row) => {
        if (err){
            res.status(400).json({"error":err.message});
            return;
        }
        if(!row){
            res.status(404).json({"message":"User Not found"});
            return;
        }
        console.log("Found: ");
        console.log(row);

        crypto.pbkdf2(req.body.password, row.salt, 310000, 32, 'sha256', async function(err, hashedPass){
            if(err){
                return res.status(500).send('Password gen failed');
            }
            if(!crypto.timingSafeEqual(row.password, hashedPass)){
                res.status(400).json({"message": 'Invalid username or password'});
                return; 
            }
            req.session.userId = row.email;
            res.json({
                message: "Found user w/ pass"
            })
        })
    });
})

router.get('/logout', async function(req, res, next) {
    req.session.destroy(function(err) {
        console.log('Destroyed session')
     })
     return res.json({message: "Logged out"})
  });


module.exports = router;