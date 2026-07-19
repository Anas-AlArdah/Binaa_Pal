'use strict';

const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const DEFAULT_ROLES = ['Admin', 'Client', 'Worker'];

const DEFAULT_CRAFTS = [
  {
    skill_name: 'التبليط',
    slug: 'tiling',
    icon_key: 'tiling',
    description: 'تبليط الأرضيات والجدران للحمامات والمطابخ والمساحات الخارجية',
  },
  {
    skill_name: 'الدهان',
    slug: 'painting',
    icon_key: 'painting',
    description: 'دهان داخلي وخارجي وتشطيبات وديكورات',
  },
  {
    skill_name: 'الكهرباء',
    slug: 'electrical',
    icon_key: 'electrical',
    description: 'تمديدات كهربائية، إنارة، لوحات، وتركيبات كهربائية',
  },
  {
    skill_name: 'السباكة',
    slug: 'plumbing',
    icon_key: 'plumbing',
    description: 'تمديدات مياه، صرف صحي، سخانات، وتركيب الأدوات الصحية',
  },
  {
    skill_name: 'الجبس والأسقف',
    slug: 'gypsum',
    icon_key: 'gypsum',
    description: 'أسقف مستعارة، جبس بورد، وديكورات جبسية',
  },
  {
    skill_name: 'النجارة',
    slug: 'carpentry',
    icon_key: 'carpentry',
    description: 'أثاث مخصص، أبواب، مطابخ، وأعمال خشبية',
  },
  {
    skill_name: 'الألمنيوم والحديد',
    slug: 'aluminum',
    icon_key: 'aluminum',
    description: 'شبابيك، أبواب، درابزين، وأعمال معدنية',
  },
  {
    skill_name: 'البناء والحجر',
    slug: 'masonry',
    icon_key: 'masonry',
    description: 'أعمال حجر، بناء بلوك، خرسانة، وجدران إنشائية',
  },
];

const timestampColumns = (Sequelize) => ({
  createdAt: {
    allowNull: false,
    type: Sequelize.DATE,
    defaultValue: Sequelize.fn('NOW'),
  },
  updatedAt: {
    allowNull: false,
    type: Sequelize.DATE,
    defaultValue: Sequelize.fn('NOW'),
  },
});

const addIndex = (queryInterface, table, fields, name, options = {}) =>
  queryInterface.addIndex(table, fields, { name, ...options });

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Roles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      type: {
        allowNull: false,
        type: Sequelize.STRING(32),
        unique: true,
      },
      ...timestampColumns(Sequelize),
    });

    await queryInterface.createTable('Skills', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      skill_name: {
        allowNull: false,
        type: Sequelize.STRING(120),
        unique: true,
      },
      slug: {
        allowNull: false,
        type: Sequelize.STRING(120),
        unique: true,
      },
      description: {
        allowNull: false,
        type: Sequelize.TEXT,
      },
      icon_key: {
        allowNull: false,
        type: Sequelize.STRING(80),
      },
      ...timestampColumns(Sequelize),
    });

    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      firstname: {
        allowNull: false,
        type: Sequelize.STRING(100),
      },
      lastname: {
        allowNull: false,
        type: Sequelize.STRING(100),
      },
      email: {
        allowNull: false,
        type: Sequelize.STRING(320),
        unique: true,
      },
      password: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      phone: {
        allowNull: true,
        type: Sequelize.STRING(32),
        unique: true,
      },
      location: {
        allowNull: true,
        type: Sequelize.STRING(160),
      },
      role_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: 'Roles', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      google_sub: {
        allowNull: true,
        type: Sequelize.STRING(255),
        unique: true,
      },
      auth_provider: {
        allowNull: false,
        type: Sequelize.STRING(24),
        defaultValue: 'password',
      },
      email_verified: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      ...timestampColumns(Sequelize),
    });

    await queryInterface.createTable('WorkerProfiles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      user_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        unique: true,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      bio: {
        allowNull: true,
        type: Sequelize.TEXT,
      },
      major: {
        allowNull: true,
        type: Sequelize.STRING(120),
      },
      profile_image: {
        allowNull: true,
        type: Sequelize.TEXT,
      },
      p_images: {
        allowNull: true,
        type: Sequelize.TEXT,
      },
      min_price: {
        allowNull: true,
        type: Sequelize.DECIMAL(10, 2),
      },
      max_price: {
        allowNull: true,
        type: Sequelize.DECIMAL(10, 2),
      },
      ...timestampColumns(Sequelize),
    });

    await queryInterface.createTable('Worker_Skills', {
      worker_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.INTEGER,
        references: { model: 'WorkerProfiles', key: 'user_id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      skill_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.INTEGER,
        references: { model: 'Skills', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      experience_years: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      min_price: {
        allowNull: true,
        type: Sequelize.DECIMAL(10, 2),
      },
      max_price: {
        allowNull: true,
        type: Sequelize.DECIMAL(10, 2),
      },
      ...timestampColumns(Sequelize),
    });

    await queryInterface.createTable('Requests', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      description: {
        allowNull: false,
        type: Sequelize.TEXT,
      },
      city: {
        allowNull: true,
        type: Sequelize.STRING(160),
      },
      date: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      status: {
        allowNull: false,
        type: Sequelize.STRING(24),
        defaultValue: 'pending',
      },
      user_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      worker_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      worker_profile_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: 'WorkerProfiles', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      craft_name: {
        allowNull: true,
        type: Sequelize.STRING(120),
      },
      client_name: {
        allowNull: false,
        type: Sequelize.STRING(220),
      },
      client_email: {
        allowNull: false,
        type: Sequelize.STRING(320),
      },
      client_phone: {
        allowNull: true,
        type: Sequelize.STRING(32),
      },
      ...timestampColumns(Sequelize),
    });

    await queryInterface.createTable('Reviews', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      worker_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: 'WorkerProfiles', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      request_id: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: { model: 'Requests', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      user_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      date: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
      comment: {
        allowNull: true,
        type: Sequelize.TEXT,
      },
      rating: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      punctuality: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      ...timestampColumns(Sequelize),
    });

    await queryInterface.createTable('project', {
      pro_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      user_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      title_p: {
        allowNull: false,
        type: Sequelize.STRING(180),
      },
      description_p: {
        allowNull: true,
        type: Sequelize.TEXT,
      },
      ...timestampColumns(Sequelize),
    });

    await queryInterface.createTable('Photos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      pro_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: 'project', key: 'pro_id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      image_url: {
        allowNull: false,
        type: Sequelize.TEXT,
      },
      ...timestampColumns(Sequelize),
    });

    await queryInterface.createTable('availability', {
      av_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      user_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      skill_id: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: { model: 'Skills', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      day_of_week: {
        allowNull: false,
        type: Sequelize.STRING(16),
      },
      start_time: {
        allowNull: false,
        type: Sequelize.TIME,
      },
      end_time: {
        allowNull: false,
        type: Sequelize.TIME,
      },
      is_available: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      ...timestampColumns(Sequelize),
    });

    const dayList = DAY_NAMES.map((day) => queryInterface.sequelize.escape(day)).join(', ');
    await queryInterface.sequelize.query(`
      ALTER TABLE "WorkerProfiles"
      ADD CONSTRAINT worker_profiles_price_range_check CHECK (
        ("min_price" IS NULL OR "min_price" >= 0)
        AND ("max_price" IS NULL OR "max_price" >= 0)
        AND ("min_price" IS NULL OR "max_price" IS NULL OR "max_price" >= "min_price")
      );

      ALTER TABLE "Worker_Skills"
      ADD CONSTRAINT worker_skills_experience_check CHECK (
        "experience_years" IS NULL OR "experience_years" BETWEEN 0 AND 60
      );

      ALTER TABLE "Worker_Skills"
      ADD CONSTRAINT worker_skills_price_range_check CHECK (
        ("min_price" IS NULL OR "min_price" >= 0)
        AND ("max_price" IS NULL OR "max_price" >= 0)
        AND ("min_price" IS NULL OR "max_price" IS NULL OR "max_price" >= "min_price")
      );

      ALTER TABLE "Reviews"
      ADD CONSTRAINT reviews_rating_check CHECK ("rating" BETWEEN 1 AND 5);

      ALTER TABLE "Reviews"
      ADD CONSTRAINT reviews_punctuality_check CHECK (
        "punctuality" IS NULL OR "punctuality" BETWEEN 1 AND 5
      );

      ALTER TABLE "availability"
      ADD CONSTRAINT availability_day_check CHECK ("day_of_week" IN (${dayList}));
    `);

    await addIndex(queryInterface, 'Users', ['role_id'], 'users_role_idx');
    await addIndex(queryInterface, 'Worker_Skills', ['skill_id'], 'worker_skills_skill_idx');
    await addIndex(queryInterface, 'Requests', ['user_id', 'createdAt'], 'requests_client_created_idx');
    await addIndex(queryInterface, 'Requests', ['worker_id', 'createdAt'], 'requests_worker_created_idx');
    await addIndex(queryInterface, 'Reviews', ['worker_id', 'createdAt'], 'reviews_worker_created_idx');
    await addIndex(queryInterface, 'project', ['user_id'], 'projects_user_idx');
    await addIndex(queryInterface, 'Photos', ['pro_id'], 'photos_project_idx');
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX availability_user_skill_day_unique
      ON "availability" ("user_id", COALESCE("skill_id", 0), "day_of_week")
    `);

    const now = new Date();
    await queryInterface.bulkInsert(
      'Roles',
      DEFAULT_ROLES.map((type) => ({ type, createdAt: now, updatedAt: now }))
    );
    await queryInterface.bulkInsert(
      'Skills',
      DEFAULT_CRAFTS.map((craft) => ({ ...craft, createdAt: now, updatedAt: now }))
    );

    const protectedTables = [
      'Roles',
      'Skills',
      'Users',
      'WorkerProfiles',
      'Worker_Skills',
      'Requests',
      'Reviews',
      'project',
      'Photos',
      'availability',
    ];

    for (const table of protectedTables) {
      const quotedTable = queryInterface.queryGenerator.quoteTable(table);
      await queryInterface.sequelize.query(`ALTER TABLE ${quotedTable} ENABLE ROW LEVEL SECURITY`);
    }
  },

  async down(queryInterface) {
    const tables = [
      'availability',
      'Photos',
      'project',
      'Reviews',
      'Requests',
      'Worker_Skills',
      'WorkerProfiles',
      'Users',
      'Skills',
      'Roles',
    ];

    for (const table of tables) {
      await queryInterface.dropTable(table);
    }
  },
};
