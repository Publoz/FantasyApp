import jwt from 'jsonwebtoken';

const requireAuth = (req, res, next) => {
  let tokenHeaderKey = process.env.TOKENHEADER;
  let jwtSecretKey = process.env.SECRET;

  try {
    const token = req.header(tokenHeaderKey);

    jwt.verify(token, jwtSecretKey, (err, decoded) => {
      if (err) {
        return res.status(401).send(err);
      }
      req.user = decoded.user;
      next();
    });
  } catch (error) {
    return res.status(401).send(error);
  }
};

export default requireAuth;