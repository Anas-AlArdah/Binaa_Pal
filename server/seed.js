require('./config/env');

const bcrypt = require('bcryptjs');
const { Role, Skill, User, WorkerProfile, Worker_Skill, sequelize } = require('./models');

const PASSWORD = process.env.SEED_WORKER_PASSWORD || 'password123';

const skills = [
  { slug: 'tiling', icon_key: 'tiling', name: 'التبليط', description: 'تبليط الأرضيات والجدران للحمامات والمطابخ والمساحات الخارجية' },
  { slug: 'painting', icon_key: 'painting', name: 'الدهان', description: 'دهان داخلي وخارجي وتشطيبات وديكورات' },
  { slug: 'electrical', icon_key: 'electrical', name: 'الكهرباء', description: 'تمديدات كهربائية، إنارة، لوحات، وتركيبات كهربائية' },
  { slug: 'plumbing', icon_key: 'plumbing', name: 'السباكة', description: 'تمديدات مياه، صرف صحي، سخانات، وتركيب الأدوات الصحية' },
  { slug: 'gypsum', icon_key: 'gypsum', name: 'الجبس والأسقف', description: 'أسقف مستعارة، جبس بورد، وديكورات جبسية' },
  { slug: 'carpentry', icon_key: 'carpentry', name: 'النجارة', description: 'أثاث مخصص، أبواب، مطابخ، وأعمال خشبية' },
  { slug: 'aluminum', icon_key: 'aluminum', name: 'الألمنيوم والحديد', description: 'شبابيك، أبواب، درابزين، وأعمال معدنية' },
  { slug: 'masonry', icon_key: 'masonry', name: 'البناء والحجر', description: 'أعمال حجر، بناء بلوك، خرسانة، وجدران إنشائية' },
];

const workerSamples = [
  ['محمد', 'النجار', 'رام الله', '0599001001'],
  ['أحمد', 'خليل', 'نابلس', '0599001002'],
  ['علي', 'حسن', 'الخليل', '0599001003'],
  ['يوسف', 'صالح', 'بيت لحم', '0599001004'],
  ['إبراهيم', 'عوض', 'جنين', '0599001005'],
  ['خالد', 'منصور', 'طولكرم', '0599001006'],
  ['سامر', 'حداد', 'قلقيلية', '0599001007'],
  ['محمود', 'زكي', 'سلفيت', '0599001008'],
];

async function upsertRole(type) {
  const [role] = await Role.findOrCreate({ where: { type }, defaults: { type } });
  return role;
}

async function upsertSkill(skill) {
  const [record] = await Skill.findOrCreate({
    where: { skill_name: skill.name },
    defaults: {
      skill_name: skill.name,
      slug: skill.slug,
      description: skill.description,
      icon_key: skill.icon_key,
    },
  });

  await record.update({
    slug: skill.slug,
    description: skill.description,
    icon_key: skill.icon_key,
  });

  return record;
}

async function upsertWorker({ role, skill, sample, index }) {
  const [firstname, lastname, location, phone] = sample;
  const email = `worker${index + 1}@binaapal.test`;
  const password = await bcrypt.hash(PASSWORD, 10);

  const [user] = await User.findOrCreate({
    where: { email },
    defaults: {
      firstname,
      lastname,
      email,
      password,
      phone,
      location,
      role_id: role.id,
    },
  });

  await user.update({
    firstname,
    lastname,
    phone,
    location,
    role_id: role.id,
  });

  const [profile] = await WorkerProfile.findOrCreate({
    where: { user_id: user.id },
    defaults: {
      user_id: user.id,
      bio: `حرفي مختص في ${skill.name} بخبرة عملية وخدمة موثوقة.`,
      major: skill.name,
      min_price: 30 + index * 5,
      max_price: 120 + index * 10,
    },
  });

  await profile.update({
    bio: `حرفي مختص في ${skill.name} بخبرة عملية وخدمة موثوقة.`,
    major: skill.name,
  });

  await Worker_Skill.findOrCreate({
    where: {
      worker_id: user.id,
      skill_id: skill.id,
    },
    defaults: {
      worker_id: user.id,
      skill_id: skill.id,
    },
  });
}

async function seed() {
  await sequelize.authenticate();

  const [workerRole, clientRole] = await Promise.all([
    upsertRole('Worker'),
    upsertRole('Client'),
    upsertRole('Admin'),
  ]);

  const skillRecords = [];
  for (const skill of skills) {
    skillRecords.push(await upsertSkill(skill));
  }

  for (let index = 0; index < skillRecords.length; index += 1) {
    await upsertWorker({
      role: workerRole,
      skill: skillRecords[index],
      sample: workerSamples[index % workerSamples.length],
      index,
    });
  }

  await User.findOrCreate({
    where: { email: 'client@binaapal.test' },
    defaults: {
      firstname: 'عميل',
      lastname: 'تجريبي',
      email: 'client@binaapal.test',
      password: await bcrypt.hash(PASSWORD, 10),
      phone: '0599002000',
      location: 'رام الله',
      role_id: clientRole.id,
    },
  });

  console.log(`Seeded ${skillRecords.length} skills and ${skillRecords.length} workers.`);
}

seed()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });
