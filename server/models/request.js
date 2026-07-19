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
    description: { type: DataTypes.TEXT, allowNull: false },
    city: { type: DataTypes.STRING(160), allowNull: true },
    date: { type: DataTypes.DATE, allowNull: false },
    status: { type: DataTypes.STRING(24), allowNull: false, defaultValue: 'pending' },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    worker_id: { type: DataTypes.INTEGER, allowNull: false },
    worker_profile_id: { type: DataTypes.INTEGER, allowNull: false },
    craft_name: { type: DataTypes.STRING(120), allowNull: true },
    client_name: { type: DataTypes.STRING(220), allowNull: false },
    client_email: { type: DataTypes.STRING(320), allowNull: false },
    client_phone: { type: DataTypes.STRING(32), allowNull: true },
  }, {
    sequelize,
    modelName: 'Request',
  });
  return Request;
};
