const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../controllers/authcontrollers');

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Authentication token is required.' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);

    if (!payload?.id) {
      return res.status(401).json({ message: 'User authentication token is required.' });
    }

    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired authentication token.' });
  }
}

function authenticateAdminToken(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Admin authentication token is required.' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);

    if (!payload?.isAdmin || payload?.type !== 'admin') {
      return res.status(403).json({ message: 'Admin access only.' });
    }

    req.admin = payload;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired admin token.' });
  }
}

function getAuthenticatedUserId(req) {
  const userId = Number(req.user?.id);
  return Number.isInteger(userId) && userId > 0 ? userId : null;
}

function assertAuthenticatedUser(req, res) {
  const userId = getAuthenticatedUserId(req);

  if (!userId) {
    res.status(401).json({ message: 'Authentication token is required.' });
    return null;
  }

  return userId;
}

function normalizePositiveInteger(value) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
}

function requireSelfParam(paramName = 'id') {
  return (req, res, next) => {
    const userId = assertAuthenticatedUser(req, res);
    if (!userId) return;

    const requestedUserId = normalizePositiveInteger(req.params[paramName]);
    if (!requestedUserId) {
      return res.status(400).json({ message: `${paramName} must be a positive integer.` });
    }

    if (requestedUserId !== userId) {
      return res.status(403).json({ message: 'You can only access your own records.' });
    }

    return next();
  };
}

function requireSelfBody(fieldName = 'user_id') {
  return (req, res, next) => {
    const userId = assertAuthenticatedUser(req, res);
    if (!userId) return;

    const requestedUserId = normalizePositiveInteger(req.body?.[fieldName]);
    if (!requestedUserId) {
      return res.status(400).json({ message: `${fieldName} must be a positive integer.` });
    }

    if (requestedUserId !== userId) {
      return res.status(403).json({ message: 'You can only modify your own records.' });
    }

    return next();
  };
}

function requireWorkerProfileOwner(paramName = 'id') {
  return async (req, res, next) => {
    const userId = assertAuthenticatedUser(req, res);
    if (!userId) return;

    const profileId = normalizePositiveInteger(req.params[paramName]);
    if (!profileId) {
      return res.status(400).json({ message: `${paramName} must be a positive integer.` });
    }

    try {
      const { WorkerProfile } = require('../models');
      const profile = await WorkerProfile.findByPk(profileId, { attributes: ['id', 'user_id'] });

      if (!profile) {
        return res.status(404).json({ message: 'Worker profile not found.' });
      }

      if (Number(profile.user_id) !== userId) {
        return res.status(403).json({ message: 'You can only modify your own profile.' });
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
}

function requireProjectOwner(paramName = 'id') {
  return async (req, res, next) => {
    const userId = assertAuthenticatedUser(req, res);
    if (!userId) return;

    const projectId = normalizePositiveInteger(req.params[paramName]);
    if (!projectId) {
      return res.status(400).json({ message: `${paramName} must be a positive integer.` });
    }

    try {
      const { Project } = require('../models');
      const project = await Project.findByPk(projectId, { attributes: ['pro_id', 'user_id'] });

      if (!project) {
        return res.status(404).json({ message: 'Project not found.' });
      }

      if (Number(project.user_id) !== userId) {
        return res.status(403).json({ message: 'You can only modify your own projects.' });
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
}

function requireProjectBodyOwner(fieldName = 'pro_id') {
  return async (req, res, next) => {
    const userId = assertAuthenticatedUser(req, res);
    if (!userId) return;

    const projectId = normalizePositiveInteger(req.body?.[fieldName]);
    if (!projectId) {
      return res.status(400).json({ message: `${fieldName} must be a positive integer.` });
    }

    try {
      const { Project } = require('../models');
      const project = await Project.findByPk(projectId, { attributes: ['pro_id', 'user_id'] });

      if (!project) {
        return res.status(404).json({ message: 'Project not found.' });
      }

      if (Number(project.user_id) !== userId) {
        return res.status(403).json({ message: 'You can only modify photos for your own projects.' });
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
}

function requirePhotoOwner(paramName = 'id') {
  return async (req, res, next) => {
    const userId = assertAuthenticatedUser(req, res);
    if (!userId) return;

    const photoId = normalizePositiveInteger(req.params[paramName]);
    if (!photoId) {
      return res.status(400).json({ message: `${paramName} must be a positive integer.` });
    }

    try {
      const { Photo, Project } = require('../models');
      const photo = await Photo.findByPk(photoId, {
        attributes: ['id', 'pro_id'],
        include: [
          {
            model: Project,
            as: 'project',
            attributes: ['pro_id', 'user_id'],
          },
        ],
      });

      if (!photo) {
        return res.status(404).json({ message: 'Photo not found.' });
      }

      if (Number(photo.project?.user_id) !== userId) {
        return res.status(403).json({ message: 'You can only modify photos in your own projects.' });
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
}

function requireAvailabilityOwner(paramName = 'id') {
  return async (req, res, next) => {
    const userId = assertAuthenticatedUser(req, res);
    if (!userId) return;

    const availabilityId = normalizePositiveInteger(req.params[paramName]);
    if (!availabilityId) {
      return res.status(400).json({ message: `${paramName} must be a positive integer.` });
    }

    try {
      const { Availability } = require('../models');
      const availability = await Availability.findOne({
        where: { av_id: availabilityId },
        attributes: ['av_id', 'user_id'],
      });

      if (!availability) {
        return res.status(404).json({ message: 'Availability record not found.' });
      }

      if (Number(availability.user_id) !== userId) {
        return res.status(403).json({ message: 'You can only modify your own availability.' });
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
}

function requireOfferOwner(paramName = 'id') {
  return async (req, res, next) => {
    const userId = assertAuthenticatedUser(req, res);
    if (!userId) return;

    const offerId = normalizePositiveInteger(req.params[paramName]);
    if (!offerId) {
      return res.status(400).json({ message: `${paramName} must be a positive integer.` });
    }

    try {
      const { Offer } = require('../models');
      const offer = await Offer.findByPk(offerId, { attributes: ['id', 'worker_id'] });

      if (!offer) {
        return res.status(404).json({ message: 'Offer not found.' });
      }

      if (Number(offer.worker_id) !== userId) {
        return res.status(403).json({ message: 'You can only modify your own offers.' });
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
}

module.exports = {
  authenticateAdminToken,
  authenticateToken,
  getAuthenticatedUserId,
  requireAvailabilityOwner,
  requireOfferOwner,
  requirePhotoOwner,
  requireProjectBodyOwner,
  requireProjectOwner,
  requireSelfBody,
  requireSelfParam,
  requireWorkerProfileOwner,
};
