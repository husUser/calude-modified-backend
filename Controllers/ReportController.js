const { Op } = require('sequelize');
const { Report } = require('../models');
const { isRealISODate } = require('../utils/reportSnapshot');

// GET /api/report/getBookingReport?fromDate=YYYY-MM-DD&toDate=YYYY-MM-DD
//
// Returns every Report row whose bookedDate is within [fromDate, toDate]
// (both inclusive). Reads ONLY the Report table, never Booking, so records
// for bookings that were later deleted are still returned.
const getBookingReport = async (req, res) => {
  const { fromDate, toDate } = req.query;

  if (!fromDate || !toDate) {
    return res
      .status(400)
      .json({ message: 'Both fromDate and toDate are required (YYYY-MM-DD).' });
  }

  if (!isRealISODate(fromDate) || !isRealISODate(toDate)) {
    return res
      .status(400)
      .json({ message: 'fromDate and toDate must be valid dates in YYYY-MM-DD format.' });
  }

  // Same fixed-width ISO format, so plain string comparison is a correct date comparison.
  if (fromDate > toDate) {
    return res
      .status(400)
      .json({ message: 'From Date cannot be later than To Date.' });
  }

  try {
    const records = await Report.findAll({
      where: { bookedDate: { [Op.between]: [fromDate, toDate] } },
      attributes: [
        'reportId',
        'bookingId',
        'displayBookingId',
        'bookedDate',
        'firstName',
        'lastName',
        'instituteId',
        'email',
        'mobileNumber',
        'professorFirstName',
        'professorLastName',
        'professorEmail',
        'equipmentName',
        'operatorName',
      ],
      order: [
        ['bookedDate', 'ASC'],
        ['createdAt', 'ASC'],
      ],
    });

    if (records.length === 0) {
      return res.status(200).json({
        message: 'No booking records found for the selected date range.',
        count: 0,
        records: [],
      });
    }

    return res.status(200).json({
      message: 'Report records fetched successfully.',
      count: records.length,
      records,
    });
  } catch (error) {
    console.error('Error fetching booking report:', error);
    return res
      .status(500)
      .json({ message: 'An error occurred while fetching the booking report.' });
  }
};

module.exports = { getBookingReport };
