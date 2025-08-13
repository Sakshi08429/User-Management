const pool = require('../config/db');

exports.showDashboard = async (req, res) => {
  try {
    const perPage = 8;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * perPage;

    // pagination
    const result = await pool.query(
      `SELECT users.id, users.username, users.email, roles.name AS role_name, users.created_at
       FROM users
       JOIN roles ON users.role_id = roles.id
       ORDER BY users.id
       LIMIT $1 OFFSET $2`,
      [perPage, offset]
    );
    const users = result.rows;
    

    // total  users
    const countResult = await pool.query(`SELECT COUNT(*) FROM users`);
    const totalUsers = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalUsers / perPage);

  const permissions = req.session.user?.permissions || [];


    res.render('dashboard', {
      user: req.session.user,
      users,
      permissions,
      totalPages,
      perPage,
      currentPage: page
    });
  } catch (err) {
    console.error('Dashboard error:', err.message);
    res.status(500).send('Something went wrong');
  }


console.log("Session user:", req.session.user);
console.log("Session permissions:", req.session.permissions);

};
