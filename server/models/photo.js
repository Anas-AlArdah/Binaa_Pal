'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Photo extends Model {
        static associate(models) {
            Photo.belongsTo(models.Project, {
                foreignKey: 'pro_id',
                as: 'project',
                onDelete: 'CASCADE',
            });
        }
    }

    Photo.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            pro_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            image_url: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'Photo',
            tableName: 'Photos',
            timestamps: true,
        }
    );

    return Photo;
};
