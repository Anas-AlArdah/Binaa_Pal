const { Review, User, WorkerProfile } = require('../models');

const REVIEW_INCLUDE = [
  {
    model: User,
    as: 'reviewer',
    attributes: ['id', 'firstname', 'lastname', 'location'],
  },
  {
    model: WorkerProfile,
    as: 'worker',
    attributes: ['id', 'user_id', 'major'],
  },
];

function buildClientError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function cleanString(value) {
  return String(value || '').trim();
}

function normalizePositiveInteger(value, fieldName) {
  const normalizedValue = typeof value === 'string' ? value.trim() : value;
  const numericValue = Number(normalizedValue);

  if (!Number.isInteger(numericValue) || numericValue <= 0) {
    throw buildClientError(`${fieldName} must be a positive integer.`);
  }

  return numericValue;
}

function normalizeOptionalPositiveInteger(value, fieldName) {
  const normalizedValue = typeof value === 'string' ? value.trim() : value;

  if (normalizedValue === undefined || normalizedValue === null || normalizedValue === '') {
    return null;
  }

  return normalizePositiveInteger(normalizedValue, fieldName);
}

function normalizeRating(value, fieldName) {
  const numericValue = normalizePositiveInteger(value, fieldName);

  if (numericValue > 5) {
    throw buildClientError(`${fieldName} must be between 1 and 5.`);
  }

  return numericValue;
}

function normalizeOptionalRating(value, fieldName, fallback = null) {
  const normalizedValue = typeof value === 'string' ? value.trim() : value;

  if (normalizedValue === undefined || normalizedValue === null || normalizedValue === '') {
    return fallback;
  }

  return normalizeRating(normalizedValue, fieldName);
}

function normalizeComment(value) {
  const comment = cleanString(value);

  if (!comment) {
    return null;
  }

  if (comment.length > 1000) {
    throw buildClientError('comment must be 1000 characters or fewer.');
  }

  return comment;
}

function getAuthenticatedUserId(req) {
  const userId = Number(req.user?.id);
  return Number.isInteger(userId) && userId > 0 ? userId : null;
}

function assertAuthenticatedUser(req) {
  const userId = getAuthenticatedUserId(req);

  if (!userId) {
    throw buildClientError('Authentication token is required.', 401);
  }

  return userId;
}

async function loadWorkerProfile(workerProfileId) {
  const profile = await WorkerProfile.findByPk(workerProfileId, {
    attributes: ['id', 'user_id'],
  });

  if (!profile) {
    throw buildClientError('Worker profile not found.', 404);
  }

  return profile;
}

function sendControllerError(res, err, fallbackMessage) {
  return res.status(err.statusCode || 500).json({
    message: err.statusCode ? err.message : fallbackMessage,
    error: err.message,
  });
}

async function getWorkerReviews(req, res) {
  try {
    const workerProfileId = normalizePositiveInteger(req.params.workerProfileId, 'workerProfileId');
    await loadWorkerProfile(workerProfileId);

    const reviews = await Review.findAll({
      where: { worker_id: workerProfileId },
      include: [
        {
          model: User,
          as: 'reviewer',
          attributes: ['id', 'firstname', 'lastname', 'location'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json(reviews);
  } catch (err) {
    console.error('getWorkerReviews error:', err);
    return sendControllerError(res, err, 'Failed to get worker reviews.');
  }
}

async function createReview(req, res) {
  try {
    const authenticatedUserId = assertAuthenticatedUser(req);
    const workerProfileId = normalizePositiveInteger(req.body.worker_id, 'worker_id');
    const workerProfile = await loadWorkerProfile(workerProfileId);

    if (Number(workerProfile.user_id) === authenticatedUserId) {
      throw buildClientError('You cannot review your own worker profile.');
    }

    const rating = normalizeRating(req.body.rating, 'rating');
    const review = await Review.create({
      worker_id: workerProfileId,
      user_id: authenticatedUserId,
      request_id: normalizeOptionalPositiveInteger(req.body.request_id, 'request_id'),
      comment: normalizeComment(req.body.comment),
      rating,
      punctuality: normalizeOptionalRating(req.body.punctuality, 'punctuality', rating),
      date: new Date(),
    });

    const fullReview = await Review.findByPk(review.id, {
      include: REVIEW_INCLUDE,
    });

    return res.status(201).json(fullReview);
  } catch (err) {
    console.error('createReview error:', err);
    return sendControllerError(res, err, 'Failed to create review.');
  }
}

module.exports = {
  createReview,
  getWorkerReviews,
};
