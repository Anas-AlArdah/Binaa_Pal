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

function authenticateAdminToken(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Admin authentication token is required.' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);

    if (!payload?.isAdmin || payload?.type !== 'admin') {
      return res.status(403).json({ message: 'Admin access only.' });
    }

    req.admin = payload;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired admin token.' });
  }
}

module.exports = {
  authenticateAdminToken,
  authenticateToken,
};
