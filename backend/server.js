import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import createDatabaseConnection from './database.js';
import authRouter from './routes/auth.js';
import requireAuth from './middlewares/requireAuth.js';

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Middleware to handle CORS
// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', process.env.PRODURL);
//   res.header('Access-Control-Allow-Credentials', true);
//   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//   next();
// });

// Use auth router
app.use('/auth', authRouter);



// Create database connection
const db = createDatabaseConnection();

app.get('/testdb', async (req, res) => {
  console.log("Received test");
  try {
    const result = await db.query('SELECT * FROM Test');
    console.log(result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error('Database query error', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/dashboard', requireAuth, (req, res) => {

  db.query(`Select * FROM Test`, (e, r)=> {
    if(!e){
        console.log(r.rows);
    } else {
        console.log(e.message);
    }
  });

  //TODO: May need to be inside callback function
  return res.json({ message: "LoggedIn" })
});


export default app;