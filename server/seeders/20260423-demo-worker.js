'use strict';

const { QueryTypes } = require('sequelize');

const roleTypes = ['Admin', 'Worker', 'Client'];

const demoUsers = [
  {
    firstname: 'مروان',
    lastname: 'حداد',
    email: 'marwan@example.com',
    password: 'password123',
    phone: '0599000000',
    location: 'الخليل، فلسطين',
    roleType: 'Worker',
  },
  {
    firstname: 'سارة',
    lastname: 'نايف',
    email: 'sara@example.com',
    password: 'password123',
    phone: '0599111111',
    location: 'بيت لحم، فلسطين',
    roleType: 'Client',
  },
  {
    firstname: 'أحمد',
    lastname: 'زكي',
    email: 'ahmed@example.com',
    password: 'password123',
    phone: '0599222222',
    location: 'نابلس، فلسطين',
    roleType: 'Worker',
  },
  {
    firstname: 'ليلى',
    lastname: 'محمود',
    email: 'layla@example.com',
    password: 'password123',
    phone: '0599333333',
    location: 'رام الله، فلسطين',
    roleType: 'Client',
  },
];

const demoProfiles = [
  {
    workerEmail: 'marwan@example.com',
    bio: 'خبير في الأنظمة الكهربائية المتكاملة بخبرة تزيد عن 15 عاماً. متخصص في تمديدات المباني الذكية وصيانة لوحات التحكم.',
    major: 'كهرباء، تمديدات، صيانة أعطال',
    min_price: 50.0,
    max_price: 150.0,
    p_images:
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e,https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc,https://images.unsplash.com/photo-1517048676732-d65bc937f952',
  },
  {
    workerEmail: 'ahmed@example.com',
    bio: 'فني تكييف وتبريد محترف. خبرة في تركيب وصيانة جميع أنواع المكيفات المركزية والمنفصلة.',
    major: 'تكييف، تبريد، صيانة أجهزة',
    min_price: 40.0,
    max_price: 120.0,
    p_images:
      'https://images.unsplash.com/photo-1599427303058-f06cb9e98118,https://images.unsplash.com/photo-1527613426441-4da17471b66d',
  },
];

const demoReviews = [
  {
    workerEmail: 'marwan@example.com',
    reviewerEmail: 'sara@example.com',
    comment: 'التعامل كان ممتاز، الحضور بالوقت، والتنفيذ نظيف جداً. أنصح بالتعامل معه.',
    rating: 5,
  },
  {
    workerEmail: 'marwan@example.com',
    reviewerEmail: 'layla@example.com',
    comment: 'شغل احترافي جداً، لكن السعر مرتفع قليلاً مقارنة بالسوق.',
    rating: 4,
  },
  {
    workerEmail: 'ahmed@example.com',
    reviewerEmail: 'sara@example.com',
    comment: 'سريع جداً في الاستجابة وحل المشكلة في وقت قياسي.',
    rating: 5,
  },
];

const demoEmails = demoUsers.map((user) => user.email);
const demoProfileBios = demoProfiles.map((profile) => profile.bio);
const demoReviewComments = demoReviews.map((review) => review.comment);

async function getExistingRoles(queryInterface) {
  return queryInterface.sequelize.query(
    'SELECT id, type FROM Roles WHERE type IN (:roleTypes)',
    {
      replacements: { roleTypes },
      type: QueryTypes.SELECT,
    }
  );
}

async function getExistingUsers(queryInterface) {
  return queryInterface.sequelize.query(
    'SELECT id, email FROM Users WHERE email IN (:emails)',
    {
      replacements: { emails: demoEmails },
      type: QueryTypes.SELECT,
    }
  );
}

async function getProfilesForCleanup(queryInterface, userIds) {
  if (userIds.length === 0 && demoProfileBios.length === 0) {
    return [];
  }

  return queryInterface.sequelize.query(
    'SELECT id, user_id FROM WorkerProfiles WHERE user_id IN (:userIds) OR bio IN (:bios)',
    {
      replacements: {
        userIds: userIds.length > 0 ? userIds : [-1],
        bios: demoProfileBios.length > 0 ? demoProfileBios : [''],
      },
      type: QueryTypes.SELECT,
    }
  );
}

async function removeExistingDemoData(queryInterface) {
  const existingUsers = await getExistingUsers(queryInterface);
  const userIds = existingUsers.map((user) => user.id);
  const existingProfiles = await getProfilesForCleanup(queryInterface, userIds);
  const profileIds = existingProfiles.map((profile) => profile.id);

  if (profileIds.length > 0 || userIds.length > 0 || demoReviewComments.length > 0) {
    await queryInterface.sequelize.query(
      'DELETE FROM Reviews WHERE worker_id IN (:profileIds) OR user_id IN (:userIds) OR comment IN (:comments)',
      {
        replacements: {
          profileIds: profileIds.length > 0 ? profileIds : [-1],
          userIds: userIds.length > 0 ? userIds : [-1],
          comments: demoReviewComments.length > 0 ? demoReviewComments : [''],
        },
      }
    );
  }

  if (profileIds.length > 0) {
    await queryInterface.bulkDelete('WorkerProfiles', { id: profileIds }, {});
  }

  if (userIds.length > 0) {
    await queryInterface.bulkDelete('Users', { id: userIds }, {});
  }
}

module.exports = {
  async up(queryInterface) {
    await removeExistingDemoData(queryInterface);

    const existingRoles = await getExistingRoles(queryInterface);
    const existingRoleTypes = new Set(existingRoles.map((role) => role.type));
    const missingRoles = roleTypes
      .filter((type) => !existingRoleTypes.has(type))
      .map((type) => ({
        type,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

    if (missingRoles.length > 0) {
      await queryInterface.bulkInsert('Roles', missingRoles, {});
    }

    const roles = await getExistingRoles(queryInterface);
    const roleIdByType = Object.fromEntries(roles.map((role) => [role.type, role.id]));

    await queryInterface.bulkInsert(
      'Users',
      demoUsers.map((user) => ({
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        password: user.password,
        phone: user.phone,
        location: user.location,
        role_id: roleIdByType[user.roleType],
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      {}
    );

    const insertedUsers = await getExistingUsers(queryInterface);
    const userIdByEmail = Object.fromEntries(insertedUsers.map((user) => [user.email, user.id]));

    await queryInterface.bulkInsert(
      'WorkerProfiles',
      demoProfiles.map((profile) => ({
        user_id: userIdByEmail[profile.workerEmail],
        bio: profile.bio,
        major: profile.major,
        min_price: profile.min_price,
        max_price: profile.max_price,
        p_images: profile.p_images,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      {}
    );

    const insertedProfiles = await getProfilesForCleanup(
      queryInterface,
      demoProfiles.map((profile) => userIdByEmail[profile.workerEmail])
    );

    const emailByUserId = Object.fromEntries(insertedUsers.map((user) => [user.id, user.email]));
    const profileIdByWorkerEmail = Object.fromEntries(
      insertedProfiles.map((profile) => [emailByUserId[profile.user_id], profile.id])
    );

    await queryInterface.bulkInsert(
      'Reviews',
      demoReviews.map((review) => ({
        worker_id: profileIdByWorkerEmail[review.workerEmail],
        user_id: userIdByEmail[review.reviewerEmail],
        comment: review.comment,
        rating: review.rating,
        date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      {}
    );
  },

  async down(queryInterface) {
    await removeExistingDemoData(queryInterface);
  },
};
