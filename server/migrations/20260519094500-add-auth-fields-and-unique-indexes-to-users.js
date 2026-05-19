'use strict';

const TABLE_NAME = 'Users';

async function getTableDefinition(queryInterface) {
  return queryInterface.describeTable(TABLE_NAME);
}

async function addColumnIfMissing(queryInterface, Sequelize, columnName, definition) {
  const tableDefinition = await getTableDefinition(queryInterface);

  if (!Object.prototype.hasOwnProperty.call(tableDefinition, columnName)) {
    await queryInterface.addColumn(TABLE_NAME, columnName, definition);
  }
}

async function removeColumnIfExists(queryInterface, columnName) {
  const tableDefinition = await getTableDefinition(queryInterface);

  if (Object.prototype.hasOwnProperty.call(tableDefinition, columnName)) {
    await queryInterface.removeColumn(TABLE_NAME, columnName);
  }
}

async function getIndexNames(queryInterface) {
  const indexes = await queryInterface.showIndex(TABLE_NAME);
  return new Set(indexes.map((index) => index.name));
}

async function hasDuplicateValues(queryInterface, Sequelize, expression, columnName) {
  const rows = await queryInterface.sequelize.query(
    `SELECT ${expression} AS value, COUNT(*) AS total
     FROM "${TABLE_NAME}"
     WHERE "${columnName}" IS NOT NULL AND TRIM("${columnName}") <> ''
     GROUP BY ${expression}
     HAVING COUNT(*) > 1
     LIMIT 1`,
    { type: Sequelize.QueryTypes.SELECT }
  );

  return rows.length > 0;
}

async function addUniqueIndexIfSafe(queryInterface, Sequelize, fields, name, duplicateExpression, columnName) {
  const indexNames = await getIndexNames(queryInterface);

  if (indexNames.has(name)) {
    return;
  }

  const hasDuplicates = await hasDuplicateValues(queryInterface, Sequelize, duplicateExpression, columnName);

  if (hasDuplicates) {
    console.warn(`Skipping ${name}: duplicate ${columnName} values already exist.`);
    return;
  }

  await queryInterface.addIndex(TABLE_NAME, fields, {
    unique: true,
    name,
  });
}

async function removeIndexIfExists(queryInterface, name) {
  const indexNames = await getIndexNames(queryInterface);

  if (indexNames.has(name)) {
    await queryInterface.removeIndex(TABLE_NAME, name);
  }
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await addColumnIfMissing(queryInterface, Sequelize, 'google_sub', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await addColumnIfMissing(queryInterface, Sequelize, 'auth_provider', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'password',
    });

    await addColumnIfMissing(queryInterface, Sequelize, 'email_verified', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await addUniqueIndexIfSafe(
      queryInterface,
      Sequelize,
      ['email'],
      'users_email_unique',
      'LOWER(email)',
      'email'
    );

    await addUniqueIndexIfSafe(
      queryInterface,
      Sequelize,
      ['phone'],
      'users_phone_unique',
      'phone',
      'phone'
    );

    await addUniqueIndexIfSafe(
      queryInterface,
      Sequelize,
      ['google_sub'],
      'users_google_sub_unique',
      'google_sub',
      'google_sub'
    );
  },

  async down(queryInterface) {
    await removeIndexIfExists(queryInterface, 'users_google_sub_unique');
    await removeIndexIfExists(queryInterface, 'users_phone_unique');
    await removeIndexIfExists(queryInterface, 'users_email_unique');
    await removeColumnIfExists(queryInterface, 'email_verified');
    await removeColumnIfExists(queryInterface, 'auth_provider');
    await removeColumnIfExists(queryInterface, 'google_sub');
  },
};
