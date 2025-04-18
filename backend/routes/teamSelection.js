import express from 'express';
var router = express.Router();
import createDatabaseConnection from "../database.js";
import jwt from 'jsonwebtoken';
import requireAuth from '../middlewares/requireAuth.js';
import { body, validationResult, query } from 'express-validator';

const db = createDatabaseConnection();

const teamSelectionQuery = 'SELECT * FROM vw_FantasySelections WHERE userId = $1 AND roundId = $2';
const playersQuery = 'SELECT * FROM vw_PlayerSelection WHERE competitionId = $1';

const rulesSelectionQuery = 'SELECT * FROM vw_selectionRules WHERE currentRoundId = $1 LIMIT 1';

//TeamSelection POST queries
const getPlayersDataQuery = 'SELECT * FROM vw_playerSelectionValidation WHERE playerid = ANY($1::int[]) AND roundid = $2 AND userid = $3';
const getCompetitionConfigQuery = 'SELECT * FROM vw_competitionConfig WHERE currentRoundId = $1 LIMIT 1';
const updateTeamQuery = 'SELECT updateTeamProcedure($1, $2, $3)';

router.get('/team', requireAuth, async (req, res, next) => {

  console.log("Received team get");
  try {
    const result = await db.query(teamSelectionQuery, [req.userId, req.query.roundId]);

    if (result.rowCount == 0) {
      return res.status(404).json({ "message": "Team Not found" });
    }

    res.json(result.rows);


  } catch (err) {
    console.error('Database query error', err);
    res.status(500).json({ "error": err.message });
  }
});

router.post('/team', requireAuth,
  [
    body('roundid')
      .notEmpty().withMessage('Round ID must be supplied')
      .isInt().withMessage('Round ID must be an integer'),
    body('selectedTeam')
      .notEmpty().withMessage('Selected team must be supplied')
      .isArray().withMessage('Selected team must be an array')
      .custom((value) => {
        if (value.length > 20) {
          throw new Error('Selected team cannot have more than 20 players');
        }
        const uniqueValues = new Set(value);
        if (uniqueValues.size !== value.length) {
          throw new Error('Selected team must have unique player IDs');
        }
        return true;
      }),
    body('selectedTeam.*').isInt().withMessage('Each player ID must be an integer')
  ],
  async (req, res, next) => {
    console.log("Received team POST");

    // Handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {

      //GET Player and config data
      const [playerDataResult, competitionConfigResult] = await Promise.all([
        db.query(getPlayersDataQuery, [req.body.selectedTeam, req.body.roundid, req.userId]),
        db.query(getCompetitionConfigQuery, [req.body.roundid]) //TODO: Check round locked and get when it locks
      ]);

      if (playerDataResult.rowCount !== req.body.selectedTeam.length) {
        return res.status(400).json({ "message": "User does not have permissions or request was invalid" });
      }

      //Check if team is valid
      const totalPriceOfTeam = playerDataResult.rows.reduce((acc, player) => acc + player.price, 0);
      if(totalPriceOfTeam > competitionConfigResult.rows[0].teambudget){
        return res.status(400).json({ "message": "Team is over budget! Your team costed " + totalPriceOfTeam + " and the budget is " + competitionConfigResult.rows[0].teambudget });
      } 

      const amountsMessage = checkAmountsMet(competitionConfigResult.rows[0].minpositions, competitionConfigResult.rows[0].maxpositions, playerDataResult.rows);
      if(amountsMessage){
        return res.status(400).json({ "message": amountsMessage });
      }

      //UPDATE Team
      await db.query(updateTeamQuery, [req.userId, req.body.roundid, req.body.selectedTeam]);

      return res.status(200).json({ "message": "Team Saved!" });

    } catch (err) {
      console.error('Database query error', err);
      res.status(500).json({ "error": err.message });
    }
  });

function checkAmountsMet(configMinimumJSON, configMaximumJSON, playerRows){
  const tally = {
    goalkeeper: 0,
    leftwing: 0,
    rightwing: 0,
    pivot: 0,
    leftback: 0,
    centreback: 0,
    rightback: 0,
    middles: 0,
    backs: 0,
    wings: 0
  };

  playerRows.forEach(player => {
    const position = player.positionname.replace(/ /g, '').toLowerCase();
    const category = getPlayerCategory(position);

    if (tally[position] !== undefined) {
      tally[position]++;
    }
    if (tally[category] !== undefined) {
      tally[category]++;
    }
  });

  let message = '';
  for (const [key, value] of Object.entries(configMinimumJSON)) {
    const lowerKey = key.toLowerCase();
    if (value !== -1 && tally[lowerKey] < value) {
      message += `Minimum amount requirement not met for ${capitalizeFirstLetter(key)} - Required: ${value}, Found: ${tally[lowerKey]}. `;
    }
  }

  for (const [key, value] of Object.entries(configMaximumJSON)) {
    const lowerKey = key.toLowerCase();
    if (value !== -1 && tally[lowerKey] > value) {
      message += `Maximum amount requirement exceeded for ${capitalizeFirstLetter(key)} - Required: ${value}, Found: ${tally[lowerKey]}. `;
    }
  }

  if(message){
    return message;
  }

  return null;
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function getPlayerCategory(position) {
  switch (position.toLowerCase()) {
    case 'left back':
    case 'leftback':
    case 'right back':
    case 'rightback':
      return 'backs';
    case 'centre back':
    case 'centreback':
    case 'pivot':
      return 'middles';
    case 'goalkeeper':
      return 'goalkeeper';
    case 'left wing':
    case 'leftwing':
    case 'right wing':
    case 'rightwing':
      return 'wings';
    default:
      throw new Error('Invalid position');
  }
}

router.get('/players', 
  query('competitionId')
    .notEmpty().withMessage('Competition ID must be supplied')
    .isInt().withMessage('Competition ID must be an integer'),
  async (req, res, next) => {

  console.log("Received players get");
  try {
    const result = await db.query(playersQuery, [req.query.competitionId]);

    if (result.rowCount == 0) {
      return res.status(404).json({ "message": "Comp not found or has no players" });
    }

    res.json(result.rows);


  } catch (err) {
    console.error('Database query error', err);
    res.status(500).json({ "error": err.message });
  }
});

router.get('/selectionRules', 
  query('roundId')
    .notEmpty().withMessage('Round ID must be supplied')
    .isInt().withMessage('Round ID must be an integer'),
  async (req, res, next) => {

  console.log("Received selection rules get");
  try {
    const result = await db.query(rulesSelectionQuery, [req.query.roundId]);

    if (result.rowCount == 0) {
      return res.status(404).json({ "message": "Comp not found or has no rules" });
    }

    res.json(result.rows);


  } catch (err) {
    console.error('Database query error', err);
    res.status(500).json({ "error": err.message });
  }
});


export default router;