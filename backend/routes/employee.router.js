const express = require('express');
const employeeController = require('../controllers/employee.controller');
const { requireAdmin, requireManager } = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @route   GET /api/employees
 * @desc    Get all employees with pagination and filtering
 * @access  Private (Admin, Manager)
 */
router.get('/', requireManager, employeeController.getAllEmployees);

/**
 * @route   GET /api/employees/:id
 * @desc    Get employee by ID
 * @access  Private (Admin, Manager)
 */
router.get('/:id', requireManager, employeeController.getEmployeeById);

/**
 * @route   POST /api/employees
 * @desc    Create new employee
 * @access  Private (Admin)
 */
router.post('/', requireAdmin, employeeController.createEmployee);

/**
 * @route   PUT /api/employees/:id
 * @desc    Update employee
 * @access  Private (Admin)
 */
router.put('/:id', requireAdmin, employeeController.updateEmployee);

/**
 * @route   DELETE /api/employees/:id
 * @desc    Delete employee (soft delete)
 * @access  Private (Admin)
 */
router.delete('/:id', requireAdmin, employeeController.deleteEmployee);

/**
 * @route   GET /api/employees/:id/activity-summary
 * @desc    Get employee activity summary
 * @access  Private (Admin, Manager)
 */
router.get('/:id/activity-summary', requireManager, employeeController.getEmployeeActivitySummary);

module.exports = router; 