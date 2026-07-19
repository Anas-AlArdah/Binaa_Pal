'use strict';
const { CRAFT_ICON_KEYS } = require('../utils/craftMetadata');
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

        Skill.hasMany(models.Availability, {
            foreignKey: 'skill_id',
            as: 'availability'
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
    skill_name: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
      },
    },
    slug: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        is: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [10, 1000],
      },
    },
    icon_key: {
      type: DataTypes.STRING(80),
      allowNull: false,
      validate: {
        notEmpty: true,
        isIn: [CRAFT_ICON_KEYS],
      },
    }
  }, {
    sequelize,
    modelName: 'Skill',
  });
  return Skill;
};

