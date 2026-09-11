module.exports = (sequelize, DataTypes) => {
  const Result = sequelize.define('Result', {
    resultId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    bookingId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    equipmentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Equipment', 
        key: 'equipmentId',
      },
    },
    guideId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    displayBookingId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    bookedDate: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slotTime: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slotDate: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    operatorStatusConfirmation: {
      type: DataTypes.ENUM(
        'completed',
        'in progress',
        'student was absent on slot time',
        'sample issue',
        'technical issue',
        'booking reserved'
      ),
      allowNull: true,
      defaultValue: 'booking reserved',
    },
    studentConfirmation: {
      type: DataTypes.ENUM('Results not collected', 'Results collected', ),
      allowNull: true,
      defaultValue: 'Results not collected',
    },
    visibility: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    timestamps: true,
  });

  Result.associate = models => {
    Result.belongsTo(models.Equipment, { foreignKey: 'equipmentId', onDelete: 'CASCADE' });
    Result.belongsTo(models.User, { foreignKey: 'userId', onDelete: 'CASCADE' });
  };

  return Result;
};
