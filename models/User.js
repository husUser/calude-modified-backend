const bcrypt = require('bcrypt'); // Ensure bcrypt is installed

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    userId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
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
    guideId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    mobileNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isNumeric: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0, 
    },
    verification: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  }, {
    timestamps: true,
    freezeTableName: true,
    indexes: [
      {
        unique: true, 
        fields: ['email'], 
      },
    ],
  });

  // Associations
  User.associate = models => {
    User.hasMany(models.Booking, {
      foreignKey: 'userId',
      onDelete: 'CASCADE',
    });
  };

  // Function to ensure default users exist
  const ensureDefaultUsersExist = async () => {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPasswordSuperAdmin = await bcrypt.hash('IALabSuperAdminRediat@524334', salt);
      await User.findOrCreate({
        where: { email: "rediat_ta@ch.iitr.ac.in" },
        defaults: {
          firstName: "Rediat",
          lastName:"Andualem",
          instituteId:"22908021",
          guideId:"Dr.Prakash Biswas",
          email:"rediat_ta@ch.iitr.ac.in",
          mobileNumber:"+917452099300",
          role: '4',
          verification:true,
          password: hashedPasswordSuperAdmin,
        },
      });
    } catch (error) {
      console.error('Error ensuring default users exist:', error);
    }
  };

  // Sequelize Hook: Run after syncing the User model
  User.addHook('afterSync', async () => {
    await ensureDefaultUsersExist();
  });

  return User;
};

