const express = require('express');
const { getBookingReport } = require('../Controllers/ReportController');
const { authenticateToken } = require('../Auth/Auth');
const { checkRole } = require('../middleware/CheckRole');
const ReportRouter = express.Router();

// Roles: 3 = admin, 4 = super-admin (see Auth/Auth.js). The JWT carries
// userRole as a number; the string forms are listed as well because
// checkRole uses strict equality via Array.includes.
ReportRouter.get(
  '/getBookingReport',
  authenticateToken,
  checkRole([3, 4, '3', '4']),
  getBookingReport
);

module.exports = { ReportRouter };
