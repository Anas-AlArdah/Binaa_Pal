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
        Request.belongsTo(models.Offer, {
            foreignKey: 'offers_id',
            as: 'offer',
        });


    }
  }
  Request.init({
    description: DataTypes.STRING,
    city: DataTypes.STRING,
    date: DataTypes.DATE,
    status: DataTypes.STRING,
    user_id: DataTypes.INTEGER,
    offers_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Request',
  });
  return Request;
};