const { Op } = require('sequelize');
const { Request, Review, Skill, User, WorkerProfile } = require('../models');

async function countSafely(model, options = {}) {
  try {
    return await model.count(options);
  } catch (error) {
    return 0;
  }
}

function formatUserName(user) {
  if (!user) {
    return 'غير محدد';
  }

  return [user.firstname, user.lastname].filter(Boolean).join(' ') || user.email || 'غير محدد';
}

async function getDashboard(req, res) {
  try {
    const [
      usersCount,
      workersCount,
      requestsCount,
      skillsCount,
      reviewsCount,
      openRequestsCount,
      completedRequestsCount,
    ] = await Promise.all([
      countSafely(User),
      countSafely(WorkerProfile),
      countSafely(Request),
      countSafely(Skill),
      countSafely(Review),
      countSafely(Request, {
        where: {
          status: {
            [Op.notIn]: ['completed', 'مكتمل', 'done', 'closed'],
          },
        },
      }),
      countSafely(Request, {
        where: {
          status: {
            [Op.in]: ['completed', 'مكتمل', 'done', 'closed'],
          },
        },
      }),
    ]);

    const [recentRequests, recentWorkers] = await Promise.all([
      Request.findAll({
        limit: 5,
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'description', 'city', 'date', 'status', 'createdAt'],
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['firstname', 'lastname', 'email'],
            required: false,
          },
        ],
      }).catch(() => []),
      WorkerProfile.findAll({
        limit: 5,
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'major', 'bio', 'min_price', 'max_price', 'createdAt'],
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['firstname', 'lastname', 'email', 'location'],
            required: false,
          },
        ],
      }).catch(() => []),
    ]);

    res.status(200).json({
      stats: {
        users: usersCount,
        workers: workersCount,
        requests: requestsCount,
        crafts: skillsCount,
        reviews: reviewsCount,
        openRequests: openRequestsCount,
        completedRequests: completedRequestsCount,
      },
      recentRequests: recentRequests.map((request) => ({
        id: request.id,
        customer: formatUserName(request.user),
        service: request.description || 'طلب خدمة',
        city: request.city || 'غير محدد',
        status: request.status || 'جديد',
        date: request.date || request.createdAt,
      })),
      recentWorkers: recentWorkers.map((worker) => ({
        id: worker.id,
        name: formatUserName(worker.user),
        service: worker.major || 'غير محدد',
        city: worker.user?.location || 'غير محدد',
        priceRange:
          worker.min_price && worker.max_price
            ? `${worker.min_price} - ${worker.max_price}`
            : 'غير محدد',
      })),
      platform: {
        apiStatus: 'متصل',
        databaseStatus: 'متصل',
        adminEmail: req.admin.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to load admin dashboard.',
      error: error.message,
    });
  }
}

module.exports = {
  getDashboard,
};
