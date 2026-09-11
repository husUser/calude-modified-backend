const express = require('express');
const { createClearance} = require('../Controllers/ClearanceController');
const ClearanceRouter = express.Router();

ClearanceRouter.post('/clearBookingHistoryAutomatically', createClearance);

module.exports = {ClearanceRouter};
