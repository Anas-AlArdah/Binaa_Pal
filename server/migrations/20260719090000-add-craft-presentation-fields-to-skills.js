'use strict';

const craftRows = [
  {
    name: 'التبليط',
    slug: 'tiling',
    icon_key: 'tiling',
    description: 'تبليط الأرضيات والجدران للحمامات والمطابخ والمساحات الخارجية',
  },
  {
    name: 'الدهان',
    slug: 'painting',
    icon_key: 'painting',
    description: 'دهان داخلي وخارجي وتشطيبات وديكورات',
  },
  {
    name: 'الكهرباء',
    slug: 'electrical',
    icon_key: 'electrical',
    description: 'تمديدات كهربائية، إنارة، لوحات، وتركيبات كهربائية',
  },
  {
    name: 'السباكة',
    slug: 'plumbing',
    icon_key: 'plumbing',
    description: 'تمديدات مياه، صرف صحي، سخانات، وتركيب الأدوات الصحية',
  },
  {
    name: 'الجبس والأسقف',
    slug: 'gypsum',
    icon_key: 'gypsum',
    description: 'أسقف مستعارة، جبس بورد، وديكورات جبسية',
  },
  {
    name: 'النجارة',
    slug: 'carpentry',
    icon_key: 'carpentry',
    description: 'أثاث مخصص، أبواب، مطابخ، وأعمال خشبية',
  },
  {
    name: 'الألمنيوم والحديد',
    slug: 'aluminum',
    icon_key: 'aluminum',
    description: 'شبابيك، أبواب، درابزين، وأعمال معدنية',
  },
  {
    name: 'البناء والحجر',
    slug: 'masonry',
    icon_key: 'masonry',
    description: 'أعمال حجر، بناء بلوك، خرسانة، وجدران إنشائية',
  },
];

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('Skills');

    if (!table.slug) {
      await queryInterface.addColumn('Skills', 'slug', {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      });
    }

    if (!table.description) {
      await queryInterface.addColumn('Skills', 'description', {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }

    if (!table.icon_key) {
      await queryInterface.addColumn('Skills', 'icon_key', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    for (const craft of craftRows) {
      await queryInterface.bulkUpdate(
        'Skills',
        {
          slug: craft.slug,
          description: craft.description,
          icon_key: craft.icon_key,
          updatedAt: new Date(),
        },
        { skill_name: craft.name }
      );
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('Skills');

    if (table.icon_key) {
      await queryInterface.removeColumn('Skills', 'icon_key');
    }

    if (table.description) {
      await queryInterface.removeColumn('Skills', 'description');
    }

    if (table.slug) {
      await queryInterface.removeColumn('Skills', 'slug');
    }
  },
};
