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
    firstname: DataTypes.STRING,
    lastname: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      unique: true,
    },
    password: DataTypes.STRING,
    phone: {
      type: DataTypes.STRING,
      unique: true,
    },
    location: DataTypes.STRING,
    role_id: DataTypes.INTEGER,
    google_sub: {
      type: DataTypes.STRING,
      unique: true,
    },
    auth_provider: {
      type: DataTypes.STRING,
      defaultValue: 'password',
    },
    email_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};
