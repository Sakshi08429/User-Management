const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { requireLogin, requirePermission } = require('../middlewares/authMiddleware');

router.get('/add', requireLogin, requirePermission('add_role'), roleController.showAddRoleForm);
router.post('/add', requireLogin, requirePermission('add_role'), roleController.addRole);

module.exports = router;