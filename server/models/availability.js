'use strict';

const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Availability extends Model {
        static associate(models) {
            Availability.belongsTo(models.User, {
                foreignKey: 'user_id',
                targetKey: 'id',
                as: 'user',
            });
        }
    }

    Availability.init(
        {
            av_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },

            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },

            day_of_week: {
                type: DataTypes.ENUM(
                    'Sunday',
                    'Monday',
                    'Tuesday',
                    'Wednesday',
                    'Thursday',
                    'Friday',
                    'Saturday'
                ),
                allowNull: false,
            },

            start_time: {
                type: DataTypes.TIME,
                allowNull: false,
            },

            end_time: {
                type: DataTypes.TIME,
                allowNull: false,
            },

            is_available: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
        },
        {
            sequelize,
            modelName: 'Availability',
            tableName: 'availability',
            timestamps: true,
        }
    );

    return Availability;
};