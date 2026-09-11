// routes/bookingRoutes.js
const express = require('express');
const { bookEquipment,getBookingById,getStudentBooking, clearWeeklyBooking, getActiveBookingPeriod } = require('../Controllers/BookingController');
const BookingRouter = express.Router();

BookingRouter.post('/equipmentBookings', bookEquipment);
BookingRouter.get('/status/:equipmentId', getBookingById);
BookingRouter.get('/getStudentSingleBooking/:userId', getStudentBooking);
BookingRouter.get('/activePeriod', getActiveBookingPeriod);
BookingRouter.delete('/cleanOldBooking', clearWeeklyBooking);

module.exports = {BookingRouter};


