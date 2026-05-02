'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Worker_Skill extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Worker_Skill.belongsTo(models.Worker_Profile || models.User, {
        foreignKey: 'worker_id',
        as: 'worker_profile'
      });
      Worker_Skill.belongsTo(models.Skill, {
        foreignKey: 'skill_id',
        as: 'skill'
      });
    }
  }
  Worker_Skill.init({
    worker_id: DataTypes.INTEGER,
    skill_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Worker_Skill',
  });
  return Worker_Skill;
};