const pool = require('../config/db');
const Joi = require('joi');


const roleSchema = Joi.object({
  name: Joi.string().required(),
  permissions: Joi.array().items(Joi.number()).default([]), 
});

exports.showAddRoleForm = async (req, res) => {
  try {
    const { rows: permissions } = await pool.query('SELECT * FROM permissions');
    res.render('roles/add', { permissions, error: null });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.addRole = async (req, res) => {
  try {
    let { name, permissions } = req.body;

    if (!permissions) {
      permissions = [];
    }

    // Make sure permissions is always an array
    if (!Array.isArray(permissions)) {
      permissions = [permissions];
    }




    // Convert all permissions to integers and validate
    permissions = permissions.map(p => {
      const parsed = parseInt(p);
      if (isNaN(parsed)) throw new Error('Invalid permission ID');
      return parsed;
    });



   
    const { error } = roleSchema.validate({ name, permissions });
    if (error) {
      const { rows: permissionsList } = await pool.query('SELECT * FROM permissions');
      return res.render('roles/add', {
        permissions: permissionsList,
        error: error.details[0].message,
      });
    }

    
    const check = await pool.query('SELECT * FROM roles WHERE name=$1', [name]);
    if (check.rows.length > 0) {
      const { rows: permissionsList } = await pool.query('SELECT * FROM permissions');
      return res.render('roles/add', {
        permissions: permissionsList,
        error: 'Role already exists',
      });
    }

    
    await pool.query('INSERT INTO roles (name, permission_ids) VALUES ($1, $2)', [
      name,
      permissions,
    ]);

    res.redirect('/dashboard');
  } catch (err) {
    console.error('Add role error:', err.message);
    const { rows: permissionsList } = await pool.query('SELECT * FROM permissions');
    res.render('roles/add', {
      permissions: permissionsList,
      error: 'Server Error or Invalid Input',
    });
  }
};
