const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../controllers/authcontrollers');

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Authentication token is required.' });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired authentication token.' });
  }
}

module.exports = {
  authenticateToken,
};
