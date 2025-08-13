const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireLogin, requirePermission } = require('../middlewares/authMiddleware');

router.get('/', requireLogin, requirePermission('view'), userController.getAllUsers);
router.get('/add', requireLogin, requirePermission('add_user'), userController.showAddUserForm);
router.post('/add', requireLogin, requirePermission('add_user'), userController.addUser);
router.get('/edit/:id', requireLogin, requirePermission('edit'), userController.showEditUserForm);
router.post('/edit/:id', requireLogin, requirePermission('edit'), userController.editUser);
router.get('/delete/:id', requireLogin, requirePermission('delete'), userController.removeUser);

module.exports = router;
