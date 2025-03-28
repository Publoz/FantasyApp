import express from 'express';
var router = express.Router();
import createDatabaseConnection from "../database.js";
import jwt from 'jsonwebtoken';
import requireAuth from '../middlewares/requireAuth.js';

const db = createDatabaseConnection();

const query = 'SELECT * FROM vw_UsersToCompetitions WHERE userId = $1';


router.get('/competitions', requireAuth, async (req, res, next) => {
  
  console.log("Received competitons get");
  try {
      const result = await db.query(query, [req.userId]);
  
      if (result.rowCount == 0) {
        return res.status(404).json({ "message": "User has no competitions entered" });
      }

      res.json(result.rows);
  
  
    } catch (err) {
      console.error('Database query error', err);
      res.status(500).json({ "error": err.message });
    }
});

export default router;