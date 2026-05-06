'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Review belongs to a WorkerProfile
      Review.belongsTo(models.WorkerProfile, {
        foreignKey: 'worker_id',
        as: 'worker'
      });
      // Review belongs to a User (reviewer)
      Review.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'reviewer'
      });
    }
  }
  Review.init({
    worker_id: DataTypes.INTEGER,
    request_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    date: DataTypes.DATE,
    comment: DataTypes.TEXT,
    rating: DataTypes.INTEGER,
    punctuality: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Review',
  });
  return Review;
};
