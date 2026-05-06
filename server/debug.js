const { WorkerProfile, User, Review } = require('./models');

async function debug() {
  try {
    const profile = await WorkerProfile.findByPk(7, {
      include: [
        {
          model: User,
          as: 'user',
        },
        {
          model: Review,
          as: 'reviews',
          include: [
            {
              model: User,
              as: 'reviewer',
            }
          ]
        }
      ]
    });
    console.log(JSON.stringify(profile, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

debug();
