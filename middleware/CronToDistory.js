const cron = require('node-cron');
const { Clearance, Bookings } = require('../models'); // Adjust path as per your project structure
const { Op } = require('sequelize');

// Cron job scheduled to run every 24 hours
cron.schedule('0 */24 * * *', async () => {  
  try {
    console.log('Running Clearance Cleanup Job...');

    // Fetch the latest clearance date
    const clearance = await Clearance.findOne({
      order: [['createdAt', 'DESC']], // Get the latest entry
    });

    if (!clearance) {
      console.log('No clearance date found.');
      return;
    }

    // Convert clearanceDate string to a Date object
    const clearanceDate = new Date(clearance.clearanceDate);
    clearanceDate.setHours(0, 0, 0, 0); // Normalize to start of the day

    // Delete all Blocking records where createdAt is before or equal to clearanceDate
    const deletedBookingRecords = await Bookings.destroy({
      where: {
        createdAt: {
          [Op.lte]: clearanceDate, // Less than or equal to clearance date
        },
      },
    });

    console.log(`${deletedBookingRecords} booking records cleared.`);

    // Delete all records from the Clearance table
    const deletedClearanceRecords = await Clearance.destroy({
      where: {}, // Deletes everything from Clearance table
    });

    console.log(`${deletedClearanceRecords} clearance records cleared.`);

  } catch (error) {
    console.error('Error in cron job:', error);
  }
});

module.exports = cron;
