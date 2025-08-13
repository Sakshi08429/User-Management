const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.requireLogin = (req, res, next) => {
  const token = req.session.token;
  if (!token) return res.redirect('/login');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Invalid token');
    return res.redirect('/login');
  }
};

exports.requirePermission = (permName) => {
  return (req, res, next) => {
    const { permissions } = req.user;
    if (!permissions || !permissions.includes(permName)) {
      return res.status(403).send('Forbidden: No Permission');
    }
    next();
  };
};