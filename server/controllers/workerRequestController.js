const { Request, User } = require('../models');
const { notifyN8n } = require('../utils/notifyN8n');
const { sendEmail } = require('../utils/emailService');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HTML_ESCAPE_LOOKUP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

const AR = {
  clientNameFallback: '\u0639\u0645\u064a\u0644 \u0628\u0646\u0627\u0621 \u0628\u0627\u0644',
  emailTitle: '\u0637\u0644\u0628 \u062e\u062f\u0645\u0629 \u062c\u062f\u064a\u062f - \u0628\u0646\u0627\u0621 \u0628\u0627\u0644',
  greeting: '\u0645\u0631\u062d\u0628\u0627\u064b',
  comma: '\u060c',
  requestIntro: '\u0644\u0642\u062f \u062a\u0644\u0642\u064a\u062a \u0637\u0644\u0628 \u062e\u062f\u0645\u0629 \u062c\u062f\u064a\u062f \u0645\u0646',
  serviceDetails: '\u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u062e\u062f\u0645\u0629:',
  city: '\u0627\u0644\u0645\u062f\u064a\u0646\u0629:',
  notSpecified: '\u063a\u064a\u0631 \u0645\u062d\u062f\u062f',
  contactInfo: '\u0645\u0639\u0644\u0648\u0645\u0627\u062a \u0627\u0644\u062a\u0648\u0627\u0635\u0644 \u0645\u0639 \u0627\u0644\u0639\u0645\u064a\u0644:',
  phone: '\u0627\u0644\u0647\u0627\u062a\u0641:',
  notAvailable: '\u063a\u064a\u0631 \u0645\u062a\u0648\u0641\u0631',
  email: '\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a:',
  signoff: '\u0628\u0627\u0644\u062a\u0648\u0641\u064a\u0642\u060c',
  team: '\u0641\u0631\u064a\u0642 \u0645\u0646\u0635\u0629 \u0628\u0646\u0627\u0621 \u0628\u0627\u0644',
  subjectPrefix: '\u0637\u0644\u0628 \u062e\u062f\u0645\u0629 \u062c\u062f\u064a\u062f:',
  maintenance: '\u0635\u064a\u0627\u0646\u0629',
};

function cleanString(value) {
  return String(value || '').trim();
}

function cleanHeader(value) {
  return cleanString(value).replace(/[\r\n]+/g, ' ');
}

function escapeHtml(value) {
  return cleanString(value).replace(/[&<>"']/g, (char) => HTML_ESCAPE_LOOKUP[char]);
}

function optionalNumber(value) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
}

async function resolveClientUserId(body, clientEmail) {
  const userId = optionalNumber(body.clientUserId || body.userId || body.user_id);

  if (!userId) {
    const user = await User.findOne({
      where: { email: clientEmail },
      attributes: ['id'],
    });

    return user?.id || null;
  }

  return userId;
}

async function saveRequest(body, payload) {
  const userId = await resolveClientUserId(body, payload.data.clientEmail);

  return Request.create({
    description: payload.data.serviceDescription.slice(0, 255),
    city: payload.data.city || null,
    date: new Date(),
    status: 'pending',
    user_id: userId,
    worker_id: payload.data.workerId,
    worker_profile_id: payload.data.profileId,
    craft_name: payload.data.craftName || null,
    client_name: payload.data.clientName || null,
    client_email: payload.data.clientEmail || null,
    client_phone: payload.data.clientPhone || null,
  });
}

function formatRequest(requestModel) {
  const request = requestModel?.get ? requestModel.get({ plain: true }) : requestModel;

  return {
    id: request.id,
    description: request.description,
    city: request.city,
    date: request.date,
    status: request.status || 'pending',
    craftName: request.craft_name || '',
    clientName:
      request.client_name ||
      [request.user?.firstname, request.user?.lastname].filter(Boolean).join(' ').trim() ||
      AR.clientNameFallback,
    clientEmail: request.client_email || request.user?.email || '',
    clientPhone: request.client_phone || request.user?.phone || '',
    clientLocation: request.user?.location || request.city || '',
    workerId: request.worker_id,
    workerProfileId: request.worker_profile_id,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
  };
}

async function requestWorker(req, res) {
  const authenticatedUserId = optionalNumber(req.user?.id);
  const clientEmail = cleanString(req.user?.email || req.body.clientEmail).toLowerCase();
  const workerEmail = cleanString(req.body.workerEmail).toLowerCase();
  const serviceDescription = cleanString(req.body.serviceDescription || req.body.description);

  if (!authenticatedUserId) {
    return res.status(401).json({
      message: 'Authentication token is required.',
    });
  }

  if (!clientEmail) {
    return res.status(400).json({
      message: 'clientEmail is required.',
    });
  }

  if (!EMAIL_PATTERN.test(clientEmail)) {
    return res.status(400).json({
      message: 'clientEmail must be a valid email address.',
    });
  }

  if (!workerEmail) {
    return res.status(400).json({
      message: 'workerEmail is required.',
    });
  }

  if (!EMAIL_PATTERN.test(workerEmail)) {
    return res.status(400).json({
      message: 'workerEmail must be a valid email address.',
    });
  }

  if (!serviceDescription) {
    return res.status(400).json({
      message: 'serviceDescription is required.',
    });
  }

  const clientName = cleanString(req.body.clientName) || 'Binaa Pal Client';
  const workerName = cleanString(req.body.workerName) || 'Binaa Pal Worker';
  const payload = {
    event: 'worker.requested',
    data: {
      requestType: 'service',
      clientName,
      clientEmail,
      clientPhone: cleanString(req.body.clientPhone),
      workerId: optionalNumber(req.body.workerId),
      workerName,
      workerEmail,
      profileId: optionalNumber(req.body.profileId),
      craftName: cleanString(req.body.craftName),
      city: cleanString(req.body.city),
      serviceDescription,
      requestedFrom: 'Worker Profile Page',
    },
    sentAt: new Date().toISOString(),
  };

  try {
    const savedRequest = await saveRequest(
      { ...req.body, clientUserId: authenticatedUserId },
      payload
    );
    const n8nResult = await notifyN8n(payload);
    const safeWorkerName = escapeHtml(workerName);
    const safeClientName = escapeHtml(clientName);
    const safeServiceDescription = escapeHtml(serviceDescription);
    const safeCity = escapeHtml(cleanString(req.body.city) || AR.notSpecified);
    const safeClientPhone = escapeHtml(cleanString(req.body.clientPhone) || AR.notAvailable);
    const safeClientEmail = escapeHtml(clientEmail);
    const subjectCraftName = cleanHeader(req.body.craftName) || AR.maintenance;

    const emailHtml = `
      <div style="direction: rtl; font-family: sans-serif;">
        <h2>${AR.emailTitle}</h2>
        <p>${AR.greeting} <strong>${safeWorkerName}</strong>${AR.comma}</p>
        <p>${AR.requestIntro} <strong>${safeClientName}</strong>.</p>
        <hr />
        <p><strong>${AR.serviceDetails}</strong></p>
        <p>${safeServiceDescription}</p>
        <p><strong>${AR.city}</strong> ${safeCity}</p>
        <hr />
        <p><strong>${AR.contactInfo}</strong></p>
        <p>${AR.phone} ${safeClientPhone}</p>
        <p>${AR.email} ${safeClientEmail}</p>
        <br />
        <p>${AR.signoff}<br />${AR.team}</p>
      </div>
    `;

    const emailResult = await sendEmail({
      to: workerEmail,
      subject: `${AR.subjectPrefix} ${subjectCraftName}`,
      html: emailHtml,
    });

    return res.status(201).json({
      message: 'Service request sent successfully.',
      requestId: savedRequest?.id || null,
      request: formatRequest(savedRequest),
      n8n: n8nResult.data || null,
      n8nWarning: n8nResult.ok ? null : n8nResult.error || n8nResult.data || 'n8n did not confirm the request.',
      email: emailResult,
    });
  } catch (error) {
    console.error('requestWorker error:', error);

    return res.status(500).json({
      message: 'Failed to send service request.',
      error: error.message,
    });
  }
}

async function getWorkerRequests(req, res) {
  const workerId = optionalNumber(req.params.workerId || req.query.workerId);
  const authenticatedUserId = optionalNumber(req.user?.id);

  if (!workerId) {
    return res.status(400).json({ message: 'workerId is required.' });
  }

  if (!authenticatedUserId || workerId !== authenticatedUserId) {
    return res.status(403).json({ message: 'You can only view your own worker requests.' });
  }

  try {
    const requests = await Request.findAll({
      where: { worker_id: workerId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstname', 'lastname', 'email', 'phone', 'location'],
          required: false,
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json(requests.map(formatRequest));
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch worker requests.',
      error: error.message,
    });
  }
}

async function getClientRequests(req, res) {
  const userId = optionalNumber(req.params.userId || req.query.userId);

  if (!userId) {
    return res.status(400).json({ message: 'userId is required.' });
  }

  try {
    const requests = await Request.findAll({
      where: { user_id: userId },
      include: [
        {
          model: User,
          as: 'worker',
          attributes: ['id', 'firstname', 'lastname', 'email', 'phone', 'location'],
          required: false,
        }
      ],
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json(requests.map(r => ({
      id: r.id,
      description: r.description,
      city: r.city,
      date: r.date,
      status: r.status || 'pending',
      craftName: r.craft_name || '',
      workerName: [r.worker?.firstname, r.worker?.lastname].filter(Boolean).join(' ').trim() || 'عامل بناء بال',
      workerEmail: r.worker?.email || '',
      workerPhone: r.worker?.phone || '',
      workerLocation: r.worker?.location || '',
      workerProfileId: r.worker_profile_id,
      workerId: r.worker_id,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    })));
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch client requests.',
      error: error.message,
    });
  }
}

async function updateWorkerRequestStatus(req, res) {
  const requestId = optionalNumber(req.params.id);
  const workerId = optionalNumber(req.user?.id);
  const nextStatus = cleanString(req.body.status);
  const allowedStatuses = new Set(['pending', 'in_progress', 'completed', 'cancelled']);

  if (!requestId) {
    return res.status(400).json({ message: 'request id is required.' });
  }

  if (!workerId) {
    return res.status(401).json({ message: 'Authentication token is required.' });
  }

  if (!allowedStatuses.has(nextStatus)) {
    return res.status(400).json({ message: 'Invalid request status.' });
  }

  try {
    const request = await Request.findOne({
      where: {
        id: requestId,
        worker_id: workerId,
      },
    });

    if (!request) {
      return res.status(404).json({ message: 'Request not found.' });
    }

    await request.update({ status: nextStatus });

    return res.status(200).json(formatRequest(request));
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to update request status.',
      error: error.message,
    });
  }
}

module.exports = {
  getWorkerRequests,
  getClientRequests,
  requestWorker,
  updateWorkerRequestStatus,
};
