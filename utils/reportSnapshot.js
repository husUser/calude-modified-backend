// utils/reportSnapshot.js
//
// Builds the rows that get written to the `Report` table when a booking is
// created. Pure function (no DB access) so it is easy to test and cannot
// itself fail on a missing professor / operator.

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

// True only for a real calendar date in YYYY-MM-DD form (rejects 2026-02-31).
function isRealISODate(value) {
  const m = ISO_DATE.exec(String(value || ''));
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const dt = new Date(Date.UTC(y, mo - 1, d));
  return (
    dt.getUTCFullYear() === y && dt.getUTCMonth() === mo - 1 && dt.getUTCDate() === d
  );
}

// Today's calendar date in IST (UTC+5:30, no DST), independent of server TZ.
function todayISTString(nowMs = Date.now()) {
  return new Date(nowMs + 5.5 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

// Booking.bookedDate is a free STRING supplied by the client. The Report
// column is a real DATE, so fall back to today's IST date if the copied
// value is not a valid calendar date, so a bad value can never make the
// snapshot insert (and therefore the booking) fail.
function normalizeBookedDate(bookedDate) {
  return isRealISODate(bookedDate) ? bookedDate : todayISTString();
}

/**
 * @param {Object}   args
 * @param {Array}    args.createdBookings  Booking rows just created
 * @param {Object}   args.user             User row (booking person)
 * @param {Object|null} args.professor     Professor row for user.guideId (may be null)
 * @param {Object}   args.equipment        Equipment row
 * @returns {Array} plain objects ready for Report.bulkCreate
 */
function buildReportRows({ createdBookings, user, professor, equipment }) {
  return createdBookings.map((bk) => ({
    bookingId: bk.bookingId,
    displayBookingId: String(bk.displayBookingId),
    bookedDate: normalizeBookedDate(bk.bookedDate),

    firstName: user.firstName,
    lastName: user.lastName,
    instituteId: user.instituteId,
    email: user.email,
    mobileNumber: user.mobileNumber,

    professorFirstName: professor ? professor.firstName : null,
    professorLastName: professor ? professor.lastName : null,
    professorEmail: professor ? professor.email : null,

    equipmentName: equipment.equipmentName,
    operatorName: equipment.operatorName || null,
  }));
}

module.exports = { buildReportRows, normalizeBookedDate, isRealISODate };
