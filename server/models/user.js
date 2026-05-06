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
        // User.hasMany(models.Review, {
        //     foreignKey: 'user_id',
        //     as: 'reviews'
        // });
        // User.hasOne(models.Worker_PROFILE,{
        //     foreignKey: 'user_id',
        //     as: 'worker_profile'
        // })
        User.hasMany(models.Request,{
            foreignKey: 'user_id',
            as: 'request'
        })




    }
  }
  User.init({
    firstname: DataTypes.STRING,
    lastname: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    phone: DataTypes.STRING,
    location: DataTypes.STRING,
    role_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};