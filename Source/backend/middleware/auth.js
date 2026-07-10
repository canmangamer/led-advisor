const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_change_in_production';

// Verify JWT token middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(403).json({ error: 'No token provided' });
  
  const token = authHeader.split(' ')[1]; // Bearer TOKEN
  if (!token) return res.status(403).json({ error: 'No token provided' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Unauthorized!' });
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  });
};

// Require Admin role middleware
const requireAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Require Admin Role!' });
  }
  next();
};

module.exports = {
  verifyToken,
  requireAdmin,
  JWT_SECRET
};
