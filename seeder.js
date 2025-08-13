

const pool = require('./config/db');
const bcrypt = require('bcrypt');

async function seed() {
  const hashedPassword = await bcrypt.hash('superadmin123', 10);

  const permRes = await pool.query('SELECT id FROM permissions');
  const permIds = permRes.rows.map(p => p.id);
  
  const roleRes = await pool.query(
    `INSERT INTO roles(name, permission_ids) VALUES ($1, $2) RETURNING id`,
    ['superadmin', permIds]
  );
  const superadminRoleId = roleRes.rows[0].id;


  await pool.query(`
    INSERT INTO users (username, email, password, role_id)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (email) DO NOTHING
  `, ['Super Admin', 'superadmin@example.com', hashedPassword, superadminRoleId]);

  console.log(" Superadmin seeded!");
}

seed();
