'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Request extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
        Request.belongsTo(models.User,{
            foreignKey: 'user_id',
            as: 'user',
        })
        Request.belongsTo(models.User,{
            foreignKey: 'worker_id',
            as: 'worker',
        })
        Request.belongsTo(models.WorkerProfile,{
            foreignKey: 'worker_profile_id',
            as: 'worker_profile',
        })
    }
  }
  Request.init({
    description: DataTypes.STRING,
    city: DataTypes.STRING,
    date: DataTypes.DATE,
    status: DataTypes.STRING,
    user_id: DataTypes.INTEGER,
    worker_id: DataTypes.INTEGER,
    worker_profile_id: DataTypes.INTEGER,
    craft_name: DataTypes.STRING,
    client_name: DataTypes.STRING,
    client_email: DataTypes.STRING,
    client_phone: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Request',
  });
  return Request;
};
