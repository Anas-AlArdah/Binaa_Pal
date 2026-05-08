'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Skill extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
        Skill.hasMany(models.Worker_Skill, {
            foreignKey: 'skill_id',
            as: 'worker_skills'
        });

      Skill.belongsToMany(models.WorkerProfile, {
      through: models.Worker_Skill,
      foreignKey: 'skill_id',
      otherKey: 'worker_id',
      as: 'workers'
  });
}


  }
  Skill.init({
    skill_name:{

      type:  DataTypes.STRING,
    allowNull: false,
    validate: {
          notEmpty: true
    }
    }
  }, {
    sequelize,
    modelName: 'Skill',
  });
  return Skill;
};

