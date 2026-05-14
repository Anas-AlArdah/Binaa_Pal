'use strict';

const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Project extends Model {
        static associate(models) {
            // Project has many Photos
            Project.hasMany(models.Photo, {
                foreignKey: 'pro_id',
                as: 'photos',
                onDelete: 'CASCADE',
            });

            // Project belongs to User
            Project.belongsTo(models.User, {
                foreignKey: 'user_id',
                targetKey: 'id',
                as: 'user',
            });
        }
    }

    Project.init(
        {
            pro_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'Users',
                    key: 'id',
                },

            },
            title_p: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            description_p: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: 'Project',
            tableName: 'project',
            timestamps: true,
        }
    );

    return Project;
};