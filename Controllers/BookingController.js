
const { Op } = require('sequelize');
const { Equipment ,Booking,User,Result } = require('../models');
const { getActivePeriod, isDateInActivePeriod, isWeekendDate } = require('../utils/bookingPeriod');


// const bookEquipment = async (req, res) => {
//   const { bookings, bookingsCount, equipmentId, userID } = req.body;

//   // Function to generate a 6-digit random number
//   const generateRandomNumber = () => {
//     return Math.floor(100000 + Math.random() * 900000);
//   };

//   try {
//     // Check if equipment exists
//     const equipment = await Equipment.findOne({ where: { equipmentId } });
//     const { guideId } = await User.findOne({ where: { userID } });

//     // Ensure no duplicate bookings for the same slot
//     for (let booking of bookings) {
//       const existingBooking = await Booking.findOne({
//         where: {
//           equipmentId: equipmentId,
//           userId: userID,
//           slotDate: booking.slotDate,
//           slotTime: booking.timeSlot,
//         },
//       });

//       if (existingBooking) {
//         return res.status(400).json({ message: `Slot already booked for ${booking.slotDate} at ${booking.timeSlot}.` });
//       }
//     }

//     // Check maxBookingsPerTwoWeeks limit
//     const bookingDoneByProfessor = await Booking.count({
//       where: {
//         equipmentId: equipmentId,
//         guideId: guideId,
//       }
//     });

//     if (parseInt(bookingDoneByProfessor + bookings.length, 10) > parseInt(equipment.maxBookingsPerTwoWeeks, 10)) {
//       return res.status(201).json({ message: "Faculty quota exhausted" });
//     }

//     // Prepare booking data with unique displayBookingId
//     const bookingData = bookings.map((booking) => ({
//       userId: userID,
//       equipmentId,
//       bookedDate: booking.bookingDate,
//       slotTime: booking.timeSlot,
//       slotDate: booking.slotDate,
//       bookingStatus: "Booked",
//       guideId,
//       displayBookingId: generateRandomNumber(), // Generate unique 6-digit number for each booking
//     }));

//     // Insert bookings into the database
//     let bookingInfoForResult = await Booking.bulkCreate(bookingData);

//     // Extract the bookingIds from the inserted bookings
//     const bookingIds = bookingInfoForResult.map(booking => booking.bookingId);

//     // Prepare the result data based on the bookingIds
//     const resultData = bookingIds.map((bookingId, index) => ({
//       bookingId: bookingId,
//       userId: bookingData[index].userId,
//       equipmentId: bookingData[index].equipmentId,
//       guideId: bookingData[index].guideId,
//       bookedDate: bookingData[index].bookedDate,
//       displayBookingId: bookingData[index].displayBookingId,
//       slotDate: bookingData[index].slotDate,
//       slotTime: bookingData[index].slotTime,
//       createdAt: new Date(),
//       updatedAt: new Date(),
//     }));

//     // Bulk create the results using the extracted bookingIds
//     let bulkResult = await Result.bulkCreate(resultData);


//     return res.status(201).json({ message: "Booking successful." });
//   } catch (error) {
//     console.log(error)
//     return res.status(500).json({ message: "An error occurred while processing the booking." });
//   }
// };


const YYYYMMDD_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const bookEquipment = async (req, res) => {
  const { bookings, bookingsCount, equipmentId, userID } = req.body;

  const generateRandomNumber = () => Math.floor(100000 + Math.random() * 900000);

  if (!Array.isArray(bookings) || bookings.length === 0) {
    return res.status(400).json({ message: "No bookings provided." });
  }

  // Validate slotDate format & slotTime presence early
  for (const b of bookings) {
    if (!b.slotDate || !YYYYMMDD_REGEX.test(b.slotDate)) {
      return res.status(400).json({ message: `Invalid slotDate format (expect YYYY-MM-DD): ${b.slotDate}` });
    }
    if (!b.timeSlot) {
      return res.status(400).json({ message: `Missing timeSlot for slotDate ${b.slotDate}` });
    }
  }

  // Server-side source of truth for the active two-week period. This is
  // computed independently of whatever the frontend rendered, so a direct
  // API call cannot book a date from a closed period or a weekend.
  const activePeriod = getActivePeriod();
  for (const b of bookings) {
    if (isWeekendDate(b.slotDate)) {
      return res.status(400).json({ message: `${b.slotDate} is a holiday (Saturday/Sunday) and cannot be booked.` });
    }
    if (!isDateInActivePeriod(b.slotDate)) {
      return res.status(400).json({
        message: `${b.slotDate} is outside the currently active booking period (${activePeriod.startDate} to ${activePeriod.endDate}).`,
      });
    }
  }

  const sequelize = Booking.sequelize; // get sequelize instance
  const t = await sequelize.transaction();

  try {
    // Check equipment & guide
    const equipment = await Equipment.findOne({ where: { equipmentId } });
    if (!equipment) {
      await t.rollback();
      return res.status(404).json({ message: "Equipment not found." });
    }

    const user = await User.findOne({ where: { userID } });
    if (!user) {
      await t.rollback();
      return res.status(404).json({ message: "User not found." });
    }
    const guideId = user.guideId;

    // Check professor quota — scoped to the active two-week period only.
    // Bookings from earlier periods are never deleted, but they no longer
    // count against the current quota because their slotDate falls outside
    // [activePeriod.startDate, activePeriod.endDate].
    const bookingDoneByProfessor = await Booking.count({
      where: {
        equipmentId,
        guideId,
        slotDate: { [Op.between]: [activePeriod.startDate, activePeriod.endDate] },
      },
      transaction: t,
    });

    if (parseInt(bookingDoneByProfessor + bookings.length, 10) > parseInt(equipment.maxBookingsPerTwoWeeks, 10)) {
      await t.rollback();
      return res.status(400).json({ message: "Faculty quota exhausted" });
    }

    // Now try to create each booking atomically (findOrCreate inside transaction)
    const createdBookings = [];
    for (const b of bookings) {
      const slotDate = b.slotDate; // 'YYYY-MM-DD' string from client
      const slotTime = b.timeSlot;

      // try to atomically create; if exists, return error
      const [bookingRecord, created] = await Booking.findOrCreate({
        where: {
          equipmentId,
          slotDate,   // compare as date-only string (DATEONLY column)
          slotTime,
        },
        defaults: {
          userId: userID,
          equipmentId,
          bookedDate: b.bookingDate || slotDate,
          slotTime,
          slotDate,
          bookingStatus: "Booked",
          guideId,
          displayBookingId: generateRandomNumber(),
        },
        transaction: t,
        lock: t.LOCK.UPDATE, // request row-level lock where supported
      });

      if (!created) {
        // slot already existed; rollback and inform client which slot failed
        await t.rollback();
        return res.status(400).json({
          message: `Slot already booked for ${slotDate} at ${slotTime}.`,
        });
      }
      createdBookings.push(bookingRecord);
    }

    // Prepare resultData from createdBookings
    const resultData = createdBookings.map((bk) => ({
      bookingId: bk.bookingId,
      userId: bk.userId,
      equipmentId: bk.equipmentId,
      guideId: bk.guideId,
      bookedDate: bk.bookedDate,
      displayBookingId: bk.displayBookingId,
      slotDate: bk.slotDate,
      slotTime: bk.slotTime,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    // BulkCreate result records in same transaction
    await Result.bulkCreate(resultData, { transaction: t });

    // commit transaction
    await t.commit();

    return res.status(201).json({ message: "Booking successful." });
  } catch (error) {
    console.error("Booking error:", error);
    if (t) await t.rollback();
    return res.status(500).json({ message: "An error occurred while processing the booking." });
  }
};






const getBookingById = async (req,res)=>{
  const {equipmentId} = req.params
  try {
    const equipment = await Booking.findAll({ where: { equipmentId } });
    return res.status(201).send(equipment);
  } catch (error) {
    return res.status(500).json({ message: "An error occurred on sending booking status." });
  }
}

const getStudentBooking = async (req,res)=>{
  const {userId}=req.params
  try {
    // Fetch the booking history of the student, including the related equipment details
    const bookingHistoryOfStudent = await Booking.findAll({
      where: { userId },
      include: {
        model: Equipment,
        attributes: ['equipmentName'], // Only include the equipmentName from the Equipment table
      },
      attributes: ['bookingId', 'bookedDate', 'slotTime', 'slotDate', 'bookingStatus'], // Only include the necessary fields from Booking
    });
console.log(bookingHistoryOfStudent)
    // Respond with an empty array if no bookings are found, but still return 200 OK
    if (bookingHistoryOfStudent.length === 0) {
      return res.status(200).json({ message: ["No booking history found."] });
    }

    // Respond with the booking history along with the equipment name
    return res.status(200).json({ bookingHistoryOfStudent });
  } catch (err) {
    if (err.name === "ValidationErrorItem") {
      const validationErrors = err.errors.map((e) => e.message);
      return res.status(400).json({ errors: [validationErrors.message] });
    }
    return res.status(500).json({ errors: [err.message] });
  }
}

const getActiveBookingPeriod = async (req, res) => {
  try {
    const period = getActivePeriod();
    return res.status(200).json({
      periodIndex: period.periodIndex,
      startDate: period.startDate,
      endDate: period.endDate,
      dates: period.dates,
      transitionAt: period.transitionAt,
      nextTransitionAt: period.nextTransitionAt,
    });
  } catch (error) {
    console.error("Error computing active booking period:", error);
    return res.status(500).json({ message: "An error occurred while computing the active booking period." });
  }
};

const clearWeeklyBooking = async (req, res) => {
  try {
    // Remove all bookings from the table
    const deletedBookings = await Booking.destroy({
      where: {},
    });

    if (deletedBookings > 0) {
      return res.status(200).json( "bookings table have been cleared.");
    } else {
      return res.status(404).json({ message: 'No bookings found to clean.' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error while clearing bookings.', error: error.message });
  }
};


module.exports = { bookEquipment,getBookingById,getStudentBooking ,clearWeeklyBooking, getActiveBookingPeriod};
