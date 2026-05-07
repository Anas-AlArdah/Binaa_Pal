'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Offer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // An offer belongs to a worker profile (or User if Worker_Profile doesn't exist yet)
      Offer.belongsTo(models.Worker_Profile || models.User, {
        foreignKey: 'worker_id',
        as: 'worker_profile'
      });
    }
  }
  Offer.init({
    worker_id: DataTypes.INTEGER,
    state: DataTypes.STRING,
    date: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Offer',
  });
  return Offer;
};