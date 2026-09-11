module.exports = (sequelize, DataTypes) => {
    const Blocking = sequelize.define('Blocking', {
        blockingId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      blockingMonth: {
        type: DataTypes.ENUM(
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec'
          )
          ,
        allowNull: false,
      },
      blockingNumber: {
        type: DataTypes.ENUM(
          '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
          '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
          '21', '22', '23', '24', '25', '26', '27', '28', '29', '30','31'
        ),
        allowNull: false,
      }
      ,
      blockingMessage: {
        type: DataTypes.ENUM(
          'Public Holiday',
          'Equipment Not Working',
          'Professor Booking',
          'External User'

        ),
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
    return Blocking;
  };
  

