const {Clearance} = require('../models');
const createClearance = async (req, res) => {
    const { clearanceDate } = req.body;
  
    try {
      // Get the current date
      const currentDate = new Date();
  
      // Extract the year from the current date
      const currentYear = currentDate.getFullYear();
  
      // Get the month from the clearanceDate (e.g., "February")
      const [monthName, day] = clearanceDate.split(' ');
  
      // Create a map to convert month names to two-digit numbers
      const monthMap = {
        January: '01',
        February: '02',
        March: '03',
        April: '04',
        May: '05',
        June: '06',
        July: '07',
        August: '08',
        September: '09',
        October: '10',
        November: '11',
        December: '12',
      };
  
      // Get the numeric month (e.g., 02 for February)
      const month = monthMap[monthName];
  
      // Construct the new date in the format YYYY-MM-DD
      const formattedDate = `${currentYear}-${month}-${day.padStart(2, '0')}`;
  
      // Create the clearance entry in the database
      const newClearance = await Clearance.create({
        clearanceDate: formattedDate, // This is the date in YYYY-MM-DD format
      });
  
      res.status(201).json(newClearance);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Something went wrong' });
    }
  };
  
  module.exports = { createClearance };
  