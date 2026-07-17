const { Request, User } = require('../models');
const { notifyN8n } = require('../utils/notifyN8n');
const { sendEmail } = require('../utils/emailService');

function cleanString(value) {
  return String(value || '').trim();
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
      'عميل بناء بال',
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
  const clientEmail = cleanString(req.body.clientEmail).toLowerCase();
  const workerEmail = cleanString(req.body.workerEmail).toLowerCase();
  const serviceDescription = cleanString(req.body.serviceDescription || req.body.description);

  if (!clientEmail) {
    return res.status(400).json({
      message: 'clientEmail is required.',
    });
  }

  if (!workerEmail) {
    return res.status(400).json({
      message: 'workerEmail is required.',
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

  const savedRequest = await saveRequest(req.body, payload);
  const n8nResult = await notifyN8n(payload);

  // Try sending direct email to worker
  const emailHtml = `
    <div style="direction: rtl; font-family: sans-serif;">
      <h2>طلب خدمة جديد - بناء بال</h2>
      <p>مرحباً <strong>${workerName}</strong>،</p>
      <p>لقد تلقيت طلب خدمة جديد من <strong>${clientName}</strong>.</p>
      <hr />
      <p><strong>تفاصيل الخدمة:</strong></p>
      <p>${serviceDescription}</p>
      <p><strong>المدينة:</strong> ${cleanString(req.body.city) || 'غير محدد'}</p>
      <hr />
      <p><strong>معلومات التواصل مع العميل:</strong></p>
      <p>الهاتف: ${cleanString(req.body.clientPhone) || 'غير متوفر'}</p>
      <p>البريد الإلكتروني: ${clientEmail}</p>
      <br />
      <p>بالتوفيق،<br />فريق منصة بناء بال</p>
    </div>
  `;

  const emailResult = await sendEmail({
    to: workerEmail,
    subject: `طلب خدمة جديد: ${cleanString(req.body.craftName) || 'صيانة'}`,
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
}

async function getWorkerRequests(req, res) {
  const workerId = optionalNumber(req.params.workerId || req.query.workerId);

  if (!workerId) {
    return res.status(400).json({ message: 'workerId is required.' });
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
  const workerId = optionalNumber(req.body.workerId || req.query.workerId);
  const nextStatus = cleanString(req.body.status);
  const allowedStatuses = new Set(['pending', 'in_progress', 'completed', 'cancelled']);

  if (!requestId) {
    return res.status(400).json({ message: 'request id is required.' });
  }

  if (!workerId) {
    return res.status(400).json({ message: 'workerId is required.' });
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
