const express = require("express");
const { getBookingReport } = require("../Controllers/ReportController");
const { authenticateToken } = require("../Auth/Auth");
const ReportRouter = express.Router();

ReportRouter.get(
  "/getBookingReport",
  authenticateToken,
  // checkRole([3, 4, '3', '4']),
  getBookingReport,
);

module.exports = { ReportRouter };
