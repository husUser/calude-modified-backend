// Report: a permanent, self-contained snapshot of a booking and the people /
// equipment involved, written at the moment a booking is created.
//
// IMPORTANT: this model intentionally has NO `references`, NO associations
// and NO onDelete rules. `bookingId` is stored as plain historical data, not
// as a foreign key, so deleting a Booking (or its User / Equipment) can never
// cascade into this table. Every value below is a copy, not a live link.
module.exports = (sequelize, DataTypes) => {
  const Report = sequelize.define(
    'Report',
    {
      reportId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },

      // ---- Booking snapshot (plain values, not a FK) ----
      bookingId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      displayBookingId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      // Date the booking was made (copied from Booking.bookedDate).
      // The report date-range filter runs against this column.
      bookedDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },

      // ---- User snapshot ----
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      instituteId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      // Copied from User.mobileNumber
      mobileNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      // ---- Guide / professor snapshot ----
      professorFirstName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      professorLastName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      professorEmail: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      // ---- Equipment snapshot ----
      equipmentName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      operatorName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
      // Named indexes (not `unique: true` on a column) so that the project's
      // `sync({ alter: true })` does not keep piling up duplicate keys.
      indexes: [
        { name: 'report_bookedDate_idx', fields: ['bookedDate'] },
        { name: 'report_bookingId_idx', fields: ['bookingId'] },
      ],
    }
  );

  return Report;
};
