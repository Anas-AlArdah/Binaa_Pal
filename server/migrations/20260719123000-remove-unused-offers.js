'use strict';

async function getTableNames(queryInterface) {
  const tables = await queryInterface.showAllTables();

  return tables.map((table) => {
    if (typeof table === 'string') return table;
    return table.tableName || table.name;
  });
}

async function hasColumn(queryInterface, tableName, columnName) {
  try {
    const columns = await queryInterface.describeTable(tableName);
    return Object.prototype.hasOwnProperty.call(columns, columnName);
  } catch (error) {
    return false;
  }
}

module.exports = {
  async up(queryInterface) {
    if (await hasColumn(queryInterface, 'Requests', 'offers_id')) {
      await queryInterface.removeColumn('Requests', 'offers_id');
    }

    const tableNames = await getTableNames(queryInterface);
    if (tableNames.some((name) => String(name).toLowerCase() === 'offers')) {
      await queryInterface.dropTable('Offers');
    }
  },

  async down(queryInterface, Sequelize) {
    const tableNames = await getTableNames(queryInterface);
    if (!tableNames.some((name) => String(name).toLowerCase() === 'offers')) {
      await queryInterface.createTable('Offers', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        worker_id: {
          type: Sequelize.INTEGER,
        },
        state: {
          type: Sequelize.STRING,
        },
        date: {
          type: Sequelize.DATE,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
      });
    }

    if (!(await hasColumn(queryInterface, 'Requests', 'offers_id'))) {
      await queryInterface.addColumn('Requests', 'offers_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    }
  },
};
