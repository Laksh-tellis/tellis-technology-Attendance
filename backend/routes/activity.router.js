const express = require('express');
const activityController = require('../controllers/activity.controller');
const { requireManager } = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @route   POST /api/activities
 * @desc    Record new activity
 * @access  Private
 */
router.post('/', activityController.recordActivity);

/**
 * @route   POST /api/activities/bulk
 * @desc    Bulk record activities (for Electron agent)
 * @access  Private
 */
router.post('/bulk', activityController.bulkRecordActivities);

/**
 * @route   GET /api/activities
 * @desc    Get activities with filtering and pagination
 * @access  Private (Manager, Admin)
 */
router.get('/', requireManager, activityController.getActivities);

/**
 * @route   GET /api/activities/:id
 * @desc    Get activity by ID
 * @access  Private (Manager, Admin)
 */
router.get('/:id', requireManager, activityController.getActivityById);

/**
 * @route   PUT /api/activities/:id
 * @desc    Update activity status
 * @access  Private (Manager, Admin)
 */
router.put('/:id', requireManager, activityController.updateActivityStatus);

/**
 * @route   GET /api/activities/stats/summary
 * @desc    Get activity statistics
 * @access  Private (Manager, Admin)
 */
router.get('/stats/summary', requireManager, activityController.getActivityStats);

module.exports = router; 