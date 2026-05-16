const { Request } = require('../models');
const { notifyN8n } = require('../utils/notifyN8n');
const { sendEmail } = require('../utils/emailService');

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
      description: payload.data.serviceDescription.slice(0, 255),
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

  const savedRequest = await saveRequestIfPossible(req.body, payload);
  
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

  await sendEmail({
    to: workerEmail,
    subject: `طلب خدمة جديد: ${cleanString(req.body.craftName) || 'صيانة'}`,
    html: emailHtml,
  });

  const n8nResult = await notifyN8n(payload);

  return res.status(200).json({
    message: 'Service request sent successfully.',
    requestId: savedRequest?.id || null,
    n8n: n8nResult.data || null,
  });
}

module.exports = {
  requestWorker,
};
