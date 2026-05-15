const { Request } = require('../models');
const { notifyN8n } = require('../utils/notifyN8n');

function cleanString(value) {
  return String(value || '').trim();
}

function optionalNumber(value) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
}

async function saveRequestIfPossible(body, payload) {
  const userId = optionalNumber(body.clientUserId || body.userId || body.user_id);

  if (!userId) {
    return null;
  }

  try {
    return await Request.create({
      description: `Worker request for ${payload.data.workerName || 'worker'}`,
      city: payload.data.city || null,
      date: new Date(),
      status: 'pending',
      user_id: userId,
    });
  } catch (error) {
    console.error('Failed to save worker request locally:', error.message);
    return null;
  }
}

async function requestWorker(req, res) {
  const clientEmail = cleanString(req.body.clientEmail).toLowerCase();

  if (!clientEmail) {
    return res.status(400).json({
      message: 'clientEmail is required.',
    });
  }

  const clientName = cleanString(req.body.clientName) || 'Binaa Pal Client';
  const workerName = cleanString(req.body.workerName) || 'Binaa Pal Worker';
  const payload = {
    event: 'worker.requested',
    data: {
      clientName,
      clientEmail,
      workerId: optionalNumber(req.body.workerId),
      workerName,
      profileId: optionalNumber(req.body.profileId),
      craftName: cleanString(req.body.craftName),
      city: cleanString(req.body.city),
      requestedFrom: 'Worker Profile Page',
    },
    sentAt: new Date().toISOString(),
  };

  const savedRequest = await saveRequestIfPossible(req.body, payload);
  const n8nResult = await notifyN8n(payload);

  if (!n8nResult.ok) {
    return res.status(502).json({
      message: 'Failed to send the worker request notification.',
      requestId: savedRequest?.id || null,
      n8n: {
        status: n8nResult.status,
        data: n8nResult.data,
        error: n8nResult.error,
      },
    });
  }

  return res.status(200).json({
    message: 'Worker request sent successfully.',
    requestId: savedRequest?.id || null,
    n8n: n8nResult.data || null,
  });
}

module.exports = {
  requestWorker,
};
