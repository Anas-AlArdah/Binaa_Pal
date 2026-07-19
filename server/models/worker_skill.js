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
      Worker_Skill.belongsTo(models.WorkerProfile , {
        foreignKey: 'worker_id',
        targetKey: 'user_id',
        as: 'worker_profile'
      });
      Worker_Skill.belongsTo(models.Skill,{
        foreignKey: 'skill_id',
        as: 'skill'
      });
    }
  }
  Worker_Skill.init({
    worker_id: {
        type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false},
      skill_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          references: { model: 'Skills', key: 'id' }
      },
      experience_years: {
          type: DataTypes.INTEGER,
          allowNull: true,
          validate: {
            min: 0,
            max: 60,
          },
      },
      min_price: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: true,
          validate: {
            min: 0,
          },
      },
      max_price: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: true,
          validate: {
            min: 0,
          },
      }
  }, {
    sequelize,
    modelName: 'Worker_Skill',
    tableName: 'Worker_Skills',
  });
  return Worker_Skill;
};
