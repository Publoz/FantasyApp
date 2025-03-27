import express from 'express';
var router = express.Router();
import createDatabaseConnection from "../database.js";
import jwt from 'jsonwebtoken';
import requireAuth from '../middlewares/requireAuth.js';

const db = createDatabaseConnection();

const query = 'SELECT * FROM vw_FantasySelections WHERE userId = $1';


router.get('/team', requireAuth, async (req, res, next) => {
  
  console.log("Received team get");
  try {
      const result = await db.query(query, [req.userId]);
  
      if (result.rowCount == 0) {
        return res.status(404).json({ "message": "Team Not found" });
      }

      res.json(result.rows);
  
  
    } catch (err) {
      console.error('Database query error', err);
      res.status(500).json({ "error": err.message });
    }
});

export default router;