const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('../config/db');
require('dotenv').config();

exports.showLoginPage = (req, res) => {
  res.render('login', { error: null });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userResult = await pool.query(
      `SELECT users.*, roles.name as role_name, roles.permission_ids 
       FROM users JOIN roles ON users.role_id = roles.id 
       WHERE users.email = $1`,
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.render('login', { error: 'Invalid credentials' });
    }

    const user = userResult.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.render('login', { error: 'Invalid credentials' });
    }

  
    let permissionNames = [];
    if (user.permission_ids && user.permission_ids.length > 0) {
      const permQuery = await pool.query(
        `SELECT name FROM permissions WHERE id = ANY($1::int[])`,
        [user.permission_ids]
      );
      permissionNames = permQuery.rows.map(p => p.name); 
    }

 
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role_name,
      permissions: permissionNames
    };

 
    const token = jwt.sign(
      { id: user.id, role: user.role_name, permissions: permissionNames },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    req.session.token = token;

    console.log('Session user:', req.session.user);

    res.redirect('/dashboard');
  } catch (err) {
    console.error('Login error:', err);
    res.render('login', { error: 'Something went wrong' });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send('Logout failed');
    }
    res.redirect('/login');
  });
};
