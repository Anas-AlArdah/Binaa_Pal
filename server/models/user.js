'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
        User.belongsTo(models.Role, {
            foreignKey: 'role_id',
            as: 'role'
        });
        User.hasMany(models.Worker_Skill, {
            foreignKey: 'worker_id',
            as: 'worker_skills'

        });
        User.hasMany(models.Review, {
            foreignKey: 'user_id',
            as: 'reviews'
        });
        User.hasOne(models.WorkerProfile,{
            foreignKey: 'user_id',
            as: 'worker_profile',
            onDelete: 'CASCADE',
        })
        User.hasMany(models.Request,{
            foreignKey: 'user_id',
            as: 'request'
        })
        User.hasMany(models.Availability, {
            foreignKey: 'user_id',
            as: 'availability',
        });




    }
  }
  User.init({
    firstname: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    lastname: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(320),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(32),
      allowNull: true,
      unique: true,
    },
    location: DataTypes.STRING(160),
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    google_sub: {
      type: DataTypes.STRING(255),
      unique: true,
    },
    auth_provider: {
      type: DataTypes.STRING(24),
      allowNull: false,
      defaultValue: 'password',
    },
    email_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    email_verification_code_hash: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
    email_verification_expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    email_verification_attempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    email_verification_sent_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};
