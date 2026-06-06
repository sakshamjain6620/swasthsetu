const express = require('express');
const router = express.Router();
const { getDashboardStats, getRevenueAnalytics, getFilteredAppointments, searchPatients } = require('../controllers/admin.controller');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

router.get('/stats', verifyToken, requireRole('admin'), getDashboardStats);
router.get('/revenue', verifyToken, requireRole('admin'), getRevenueAnalytics);
router.get('/appointments', verifyToken, requireRole('admin'), getFilteredAppointments);
router.get('/patients', verifyToken, requireRole('admin'), searchPatients);

module.exports = router;
