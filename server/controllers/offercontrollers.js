const { Offer } = require('../models');

function buildClientError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function cleanString(value) {
  return String(value || '').trim();
}

function hasOwn(body, fieldName) {
  return Object.prototype.hasOwnProperty.call(body || {}, fieldName);
}

function normalizePositiveInteger(value, fieldName) {
  const normalizedValue = typeof value === 'string' ? value.trim() : value;
  const numericValue = Number(normalizedValue);

  if (!Number.isInteger(numericValue) || numericValue <= 0) {
    throw buildClientError(`${fieldName} must be a positive integer.`);
  }

  return numericValue;
}

function normalizeOptionalDate(value) {
  const normalizedValue = typeof value === 'string' ? value.trim() : value;

  if (normalizedValue === undefined || normalizedValue === null || normalizedValue === '') {
    return null;
  }

  const parsedDate = new Date(normalizedValue);

  if (Number.isNaN(parsedDate.getTime())) {
    throw buildClientError('date must be a valid date.');
  }

  return parsedDate;
}

function buildOfferPayload(body, { partial = false } = {}) {
  const payload = {};

  if (!partial || hasOwn(body, 'worker_id')) {
    payload.worker_id = normalizePositiveInteger(body.worker_id, 'worker_id');
  }

  if (!partial || hasOwn(body, 'state')) {
    payload.state = cleanString(body.state) || null;
  }

  if (!partial || hasOwn(body, 'date')) {
    payload.date = normalizeOptionalDate(body.date);
  }

  return payload;
}

function sendControllerError(res, err, fallbackMessage) {
  return res.status(err.statusCode || 500).json({
    message: fallbackMessage,
    error: err.message,
  });
}

async function createOffer(req, res) {
  try {
    const offer = await Offer.create(buildOfferPayload(req.body));
    return res.status(201).json(offer);
  } catch (err) {
    return sendControllerError(res, err, 'Failed to create offer.');
  }
}

async function getOfferById(req, res) {
  try {
    const offerId = normalizePositiveInteger(req.params.id, 'id');
    const offer = await Offer.findByPk(offerId);

    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    return res.status(200).json(offer);
  } catch (err) {
    return sendControllerError(res, err, 'Failed to get offer.');
  }
}

async function getAllOffers(req, res) {
  try {
    const offers = await Offer.findAll({
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json(offers);
  } catch (err) {
    return sendControllerError(res, err, 'Failed to get offers.');
  }
}

async function updateOffer(req, res) {
  try {
    const offerId = normalizePositiveInteger(req.params.id, 'id');
    const offer = await Offer.findByPk(offerId);

    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    await offer.update(buildOfferPayload(req.body, { partial: true }));
    return res.status(200).json(offer);
  } catch (err) {
    return sendControllerError(res, err, 'Failed to update offer.');
  }
}

async function deleteOffer(req, res) {
  try {
    const offerId = normalizePositiveInteger(req.params.id, 'id');
    const offer = await Offer.findByPk(offerId);

    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    await offer.destroy();
    return res.status(200).json({ message: 'Offer deleted successfully' });
  } catch (err) {
    return sendControllerError(res, err, 'Failed to delete offer.');
  }
}

module.exports = {
  createOffer,
  getOfferById,
  getAllOffers,
  updateOffer,
  deleteOffer,
};
