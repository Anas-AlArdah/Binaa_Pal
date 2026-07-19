const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_PORT === '465',
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendEmail({ to, subject, html }) {
  // Authentication remains optional so email outages never block core workflows.
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your-email@gmail.com') {
    console.log('Email not sent: SMTP is not configured in .env');
    return { success: false, message: 'SMTP not configured' };
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    console.log('Email sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function sendWelcomeEmail({ to, firstname, accountType }) {
  const safeFirstname = escapeHtml(firstname) || 'صديقنا';
  const isWorker = accountType === 'Worker';
  const accountLabel = isWorker ? 'عامل' : 'عميل';
  const nextStep = isWorker
    ? 'أكمل ملفك المهني وأضف أعمالك وأوقاتك حتى يتمكن العملاء من الوصول إليك.'
    : 'يمكنك الآن تصفح الصنايعية واختيار العامل المناسب لخدمتك.';

  return sendEmail({
    to,
    subject: 'أهلاً بك في Binaa Pal',
    html: `
      <div dir="rtl" style="margin:0;background:#f4f7fb;padding:32px 16px;font-family:Arial,sans-serif;color:#172033;">
        <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e3e9f2;border-radius:12px;overflow:hidden;">
          <div style="background:#16233f;padding:22px 28px;color:#ffffff;">
            <strong style="font-size:22px;">Binaa Pal</strong>
          </div>
          <div style="padding:28px;line-height:1.9;">
            <h1 style="margin:0 0 12px;font-size:24px;color:#172033;">أهلاً ${safeFirstname}</h1>
            <p style="margin:0 0 12px;">تم إنشاء حسابك كـ <strong>${accountLabel}</strong> باستخدام Google بنجاح.</p>
            <p style="margin:0 0 20px;color:#526078;">${nextStep}</p>
            <p style="margin:0;color:#526078;">فريق Binaa Pal</p>
          </div>
        </div>
      </div>
    `,
  });
}

async function sendLoginNotificationEmail({ to, firstname, authMethod }) {
  const safeFirstname = escapeHtml(firstname) || 'صديقنا';
  const safeAuthMethod = escapeHtml(authMethod) || 'الحساب';
  const loginTime = new Intl.DateTimeFormat('ar-PS', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Asia/Hebron',
  }).format(new Date());

  return sendEmail({
    to,
    subject: 'تم تسجيل الدخول إلى حسابك في Binaa Pal',
    html: `
      <div dir="rtl" style="margin:0;background:#f4f7fb;padding:32px 16px;font-family:Arial,sans-serif;color:#172033;">
        <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e3e9f2;border-radius:12px;overflow:hidden;">
          <div style="background:#16233f;padding:22px 28px;color:#ffffff;">
            <strong style="font-size:22px;">Binaa Pal</strong>
          </div>
          <div style="padding:28px;line-height:1.9;">
            <h1 style="margin:0 0 12px;font-size:23px;color:#172033;">مرحباً ${safeFirstname}</h1>
            <p style="margin:0 0 12px;">تم تسجيل الدخول إلى حسابك باستخدام <strong>${safeAuthMethod}</strong>.</p>
            <p style="margin:0 0 18px;color:#526078;">وقت الدخول: ${loginTime}</p>
            <p style="margin:0;color:#9f1239;">إذا لم تكن أنت، غيّر بيانات الدخول إلى حسابك فوراً.</p>
          </div>
        </div>
      </div>
    `,
  });
}

module.exports = { sendEmail, sendLoginNotificationEmail, sendWelcomeEmail };
