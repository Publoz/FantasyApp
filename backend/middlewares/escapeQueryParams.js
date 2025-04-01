import { query, validationResult } from 'express-validator';

const escapeQueryParams = async (req, res, next) => {
  for (const param in req.query) {
    await query(param).escape().run(req);
  }

  // Handle validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  next();
};

export default escapeQueryParams;