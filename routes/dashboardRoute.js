
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController')
const { requireLogin } = require('../middlewares/authMiddleware');

router.get('/', requireLogin, dashboardController.showDashboard);

module.exports = router;
