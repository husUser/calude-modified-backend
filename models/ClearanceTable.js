module.exports = (sequelize, DataTypes) => {
    const Clearance = sequelize.define('Clearance', {
      clearanceId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      clearanceDate: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    }, {
      timestamps: true,
      freezeTableName: true,
    });
  
    return Clearance;
  };
