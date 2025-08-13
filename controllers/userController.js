const pool = require('../config/db');
const bcrypt = require('bcrypt');
const Joi = require('joi');

const userSchema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role_id: Joi.number().required(),
});

exports.getAllUsers = async (req, res) => {
  const { page = 1, limit = 5 } = req.query;
  const offset = (page - 1) * limit;
  const totalUsers = await pool.query('SELECT COUNT(*) FROM users');
  const result = await pool.query(
    `SELECT users.*, roles.name AS role_name FROM users JOIN roles ON users.role_id = roles.id ORDER BY users.id LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  res.render('dashboard', {
    user: req.session.user,
    users: result.rows,
    permissions: req.session.permissions,
    page: parseInt(page),
    totalPages: Math.ceil(totalUsers.rows[0].count / limit)
  });
};

exports.showAddUserForm = async (req, res) => {
  const roles = await pool.query('SELECT * FROM roles');
  res.render('users/add', { roles: roles.rows, error: null });
};

exports.addUser = async (req, res) => {
  const { error } = userSchema.validate(req.body);
  if (error) {
    const roles = await pool.query('SELECT * FROM roles');
    return res.render('users/add', { roles: roles.rows, error: error.details[0].message });
  }
  const { username, email, password, role_id } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  await pool.query(
    `INSERT INTO users(username, email, password, role_id, created_at, created_by) VALUES($1, $2, $3, $4, NOW(), $5)`,
    [username, email, hashed, role_id, req.session.user.id]
  );
  res.redirect('/dashboard');
};

exports.showEditUserForm = async (req, res) => {
  const user = await pool.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
  const roles = await pool.query('SELECT * FROM roles');
  res.render('users/edit', { user: user.rows[0], roles: roles.rows });
};

exports.editUser = async (req, res) => {
  const { username, email, role_id } = req.body;
  await pool.query(
    `UPDATE users SET username=$1, email=$2, role_id=$3, updated_by=$4, updated_at=NOW() WHERE id=$5`,
    [username, email, role_id, req.session.user.id, req.params.id]
  );
  res.redirect('/dashboard');
};

exports.removeUser = async (req, res) => {
  await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
  res.redirect('/dashboard');
};
