const { Worker_Skill, Skill } = require('../models');

function buildClientError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function normalizePositiveInteger(value, fieldName) {
  const normalizedValue = typeof value === 'string' ? value.trim() : value;
  const numericValue = Number(normalizedValue);

  if (!Number.isInteger(numericValue) || numericValue <= 0) {
    throw buildClientError(`${fieldName} must be a positive integer.`);
  }

  return numericValue;
}

function normalizeExperienceYears(value) {
  const normalizedValue = typeof value === 'string' ? value.trim() : value;

  if (normalizedValue === undefined || normalizedValue === null || normalizedValue === '') {
    return null;
  }

  const numericValue = Number(normalizedValue);

  if (!Number.isInteger(numericValue) || numericValue < 0 || numericValue > 60) {
    throw buildClientError('experience_years must be a whole number between 0 and 60.');
  }

  return numericValue;
}

function normalizePrice(value, fieldName) {
  const normalizedValue = typeof value === 'string' ? value.trim() : value;

  if (normalizedValue === undefined || normalizedValue === null || normalizedValue === '') {
    return null;
  }

  const numericValue = Number(normalizedValue);

  if (!Number.isFinite(numericValue) || numericValue < 0) {
    throw buildClientError(`${fieldName} must be a positive number.`);
  }

  return numericValue;
}

function sendControllerError(res, err, fallbackMessage) {
  return res.status(err.statusCode || 500).json({
    message: fallbackMessage,
    error: err.message,
  });
}

async function addWorkerSkill(req, res) {
  try {
    const workerId = normalizePositiveInteger(req.body.worker_id, 'worker_id');
    const skillId = normalizePositiveInteger(req.body.skill_id, 'skill_id');
    const experienceYears = normalizeExperienceYears(req.body.experience_years);
    const minPrice = normalizePrice(req.body.min_price, 'min_price');
    const maxPrice = normalizePrice(req.body.max_price, 'max_price');

    if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
      throw buildClientError('min_price cannot be greater than max_price.');
    }

    const [workerSkill, created] = await Worker_Skill.findOrCreate({
      where: {
        worker_id: workerId,
        skill_id: skillId,
      },
      defaults: {
        worker_id: workerId,
        skill_id: skillId,
        experience_years: experienceYears,
        min_price: minPrice,
        max_price: maxPrice,
      },
    });

    if (!created) {
      await workerSkill.update({
        experience_years: experienceYears,
        min_price: minPrice,
        max_price: maxPrice,
      });
    }

    return res.status(created ? 201 : 200).json(workerSkill);
  } catch (err) {
    console.error('addWorkerSkill error:', err);
    return sendControllerError(res, err, 'Failed to add worker skill.');
  }
}

async function getWorkerSkillsByWorkerId(req, res) {
  try {
    const workerId = normalizePositiveInteger(req.params.worker_id, 'worker_id');
    const workerSkills = await Worker_Skill.findAll({
      where: {
        worker_id: workerId,
      },
      include: [
        {
          model: Skill,
          attributes: ['skill_name'],
          as: 'skill',
        },
      ],
    });

    return res.status(200).json(workerSkills);
  } catch (err) {
    return sendControllerError(res, err, 'Failed to get worker skills.');
  }
}

async function removeWorkerSkill(req, res) {
  try {
    const workerId = normalizePositiveInteger(req.body.worker_id, 'worker_id');
    const skillId = normalizePositiveInteger(req.body.skill_id, 'skill_id');
    const workerSkill = await Worker_Skill.findOne({
      where: {
        worker_id: workerId,
        skill_id: skillId,
      },
    });

    if (!workerSkill) {
      return res.status(404).json({ message: 'Worker skill not found' });
    }

    await workerSkill.destroy();
    return res.status(200).json({ message: 'Worker skill removed successfully' });
  } catch (err) {
    return sendControllerError(res, err, 'Failed to remove worker skill.');
  }
}

module.exports = {
  addWorkerSkill,
  getWorkerSkillsByWorkerId,
  removeWorkerSkill,
};
