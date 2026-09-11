module.exports = (sequelize, DataTypes) => {
  const Notifications = sequelize.define('Notifications', {
    notificationId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    notificationMessage: {
      type: DataTypes.STRING,
      allowNull: false,
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

  Notifications.associate = models => {
    Notifications.belongsTo(models.User, { foreignKey: 'userId', onDelete: 'CASCADE' });
  };

  return Notifications;
};
