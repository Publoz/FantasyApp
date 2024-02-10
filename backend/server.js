const express = require('express');
const app = express();
const port = 3000;

//MODULES
var db = require("./database.js")
var bodyParser = require('body-parser');


//APP USE
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


//ROUTERS
var authRouter = require('./routes/auth');
app.use('/auth', authRouter);




app.listen(port, () => console.log(`Newspaper API listening at http://localhost:${port}`));