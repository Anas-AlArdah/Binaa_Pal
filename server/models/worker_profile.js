'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class WorkerProfile extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // One WorkerProfile can have many Reviews
      WorkerProfile.hasMany(models.Review, {
        foreignKey: 'worker_id',
        as: 'reviews'
      });
      // WorkerProfile belongs to a User
      WorkerProfile.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      WorkerProfile.hasMany(models.Worker_Skill, {
        foreignKey: 'worker_id',
        sourceKey: 'user_id',
        as: 'worker_skills'
      });
    }
  }
  WorkerProfile.init({
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    bio: DataTypes.TEXT,
    major: DataTypes.STRING,
    profile_image: DataTypes.TEXT,
    p_images: DataTypes.TEXT,
    min_price: DataTypes.DECIMAL(10, 2),
    max_price: DataTypes.DECIMAL(10, 2)
  }, {
    sequelize,
    modelName: 'WorkerProfile',
    tableName: 'WorkerProfiles', // Explicit table name for clarity
  });
  return WorkerProfile;
};
//npx sequelize-cli model:generate --name WorkerProfile --attributes user_id:integer,bio:text,major:string,p_images:text,min_price:decimal,max_price:decimal
