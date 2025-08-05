const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const { requireManager } = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @route   GET /api/dashboard/overview
 * @desc    Get dashboard overview statistics
 * @access  Private (Manager, Admin)
 */
router.get('/overview', requireManager, dashboardController.getDashboardOverview);

/**
 * @route   GET /api/dashboard/productivity
 * @desc    Get productivity analytics
 * @access  Private (Manager, Admin)
 */
router.get('/productivity', requireManager, dashboardController.getProductivityAnalytics);

/**
 * @route   GET /api/dashboard/monitoring
 * @desc    Get real-time monitoring data
 * @access  Private (Manager, Admin)
 */
router.get('/monitoring', requireManager, dashboardController.getRealTimeMonitoring);

/**
 * @route   GET /api/dashboard/health
 * @desc    Get system health status
 * @access  Private (Manager, Admin)
 */
router.get('/health', requireManager, dashboardController.getSystemHealth);

module.exports = router; 