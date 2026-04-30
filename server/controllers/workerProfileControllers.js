const { WorkerProfile, User, Review } = require('../models');

async function getWorkerProfile(req, res) {
  try {
    const { id } = req.params;
    const profile = await WorkerProfile.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['firstname', 'lastname', 'email', 'phone', 'location']
        },
        {
          model: Review,
          as: 'reviews',
          include: [
            {
              model: User,
              as: 'reviewer',
              attributes: ['firstname', 'lastname', 'location']
            }
          ]
        }
      ]
    });

    if (!profile) {
      return res.status(404).json({ message: 'Worker profile not found' });
    }

    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch worker profile',
      error: error.message
    });
  }
}

async function getAllWorkerProfiles(req, res) {
  try {
    const profiles = await WorkerProfile.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['firstname', 'lastname', 'location']
        },
        {
          model: Review,
          as: 'reviews'
        }
      ]
    });
    res.status(200).json(profiles);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch worker profiles',
      error: error.message
    });
  }
}

module.exports = {
  getWorkerProfile,
  getAllWorkerProfiles
};
