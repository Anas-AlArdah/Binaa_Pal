const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { User, Role, WorkerProfile, Skill, Worker_Skill, sequelize } = require('../models');
const {
  sendEmailVerificationCode,
  sendLoginNotificationEmail,
  sendWelcomeEmail,
} = require('../utils/emailService');

const JWT_SECRET = process.env.JWT_SECRET || 'binaa_pal_dev_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
// try {
    //req.user = jwt.verify(token, JWT_SECRET)
const SALT_ROUNDS = 10;
const EMAIL_VERIFICATION_TTL_MINUTES = 10;
const EMAIL_VERIFICATION_MAX_ATTEMPTS = 5;
const EMAIL_VERIFICATION_RESEND_COOLDOWN_MS = 60 * 1000;
const ADMIN_EMAIL = normalizeEmail(process.env.ADMIN_EMAIL || 'admin@binaapal.com');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin12345';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '';
const GOOGLE_CLIENT_ID_VALUE = String(
  process.env.GOOGLE_CLIENT_ID || process.env.REACT_APP_GOOGLE_CLIENT_ID || ''
).trim();
const GOOGLE_CLIENT_ID = /\.apps\.googleusercontent\.com$/i.test(GOOGLE_CLIENT_ID_VALUE)
  && !/^(your_|replace_)/i.test(GOOGLE_CLIENT_ID_VALUE)
  ? GOOGLE_CLIENT_ID_VALUE
  : '';
const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

const ROLE_BY_USER_TYPE = {
  client: 'Client',
  worker: 'Worker',
};

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || ''));
}

function normalizeUserType(userType) {
  return ROLE_BY_USER_TYPE[String(userType || '').toLowerCase()] || ROLE_BY_USER_TYPE.client;
}

function cleanString(value) {
  return String(value || '').trim();
}

function createEmailVerificationCode() {
  return String(crypto.randomInt(100000, 1000000));
}

function hashEmailVerificationCode(email, code) {
  return crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${normalizeEmail(email)}:${String(code || '')}`)
    .digest('hex');
}

function verificationHashesMatch(actualHash, expectedHash) {
  const actual = Buffer.from(String(actualHash || ''), 'hex');
  const expected = Buffer.from(String(expectedHash || ''), 'hex');

  return actual.length > 0
    && actual.length === expected.length
    && crypto.timingSafeEqual(actual, expected);
}

function createEmailVerificationState(email) {
  const code = createEmailVerificationCode();
  const now = new Date();

  return {
    code,
    codeHash: hashEmailVerificationCode(email, code),
    expiresAt: new Date(now.getTime() + EMAIL_VERIFICATION_TTL_MINUTES * 60 * 1000),
    sentAt: now,
  };
}

function maskEmail(email) {
  const [localPart = '', domain = ''] = normalizeEmail(email).split('@');
  const visiblePrefix = localPart.slice(0, Math.min(2, localPart.length));

  return `${visiblePrefix}${'*'.repeat(Math.max(3, localPart.length - visiblePrefix.length))}@${domain}`;
}

function getPublicAuthConfig(req, res) {
  res.status(200).json({
    googleClientId: GOOGLE_CLIENT_ID,
    googleEnabled: Boolean(GOOGLE_CLIENT_ID),
    passwordRegistrationEnabled: true,
  });
}

function normalizeDigits(value) {
  const arabicDigits = '٠١٢٣٤٥٦٧٨٩';
  const persianDigits = '۰۱۲۳۴۵۶۷۸۹';

  return String(value || '').replace(/[٠-٩۰-۹]/g, (digit) => {
    const arabicIndex = arabicDigits.indexOf(digit);

    if (arabicIndex >= 0) {
      return String(arabicIndex);
    }

    return String(persianDigits.indexOf(digit));
  });
}

function normalizePhone(phone) {
  return normalizeDigits(phone).replace(/\D/g, '');
}

function validateLocalPhone(phone) {
  if (!/^05\d{8}$/.test(phone)) {
    throw createRequestError('رقم الجوال يجب أن يكون بصيغة 05XXXXXXXX بدون +970 أو أي مقدمة دولية.');
  }
}

function normalizeSkillIds(values) {
  return [
    ...new Set(
      values
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value) && value > 0)
    ),
  ];
}

function createRequestError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function createStatusError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function normalizeExperienceYears(value, fieldName, { required = false } = {}) {
  const normalizedValue = typeof value === 'string' ? value.trim() : value;

  if (normalizedValue === undefined || normalizedValue === null || normalizedValue === '') {
    if (required) {
      throw createRequestError(`${fieldName} مطلوبة.`);
    }

    return null;
  }

  const numericValue = Number(normalizedValue);

  if (!Number.isInteger(numericValue) || numericValue < 0 || numericValue > 60) {
    throw createRequestError(`${fieldName} يجب أن تكون رقما صحيحا من 0 إلى 60.`);
  }

  return numericValue;
}

function isBcryptHash(password) {
  return /^\$2[aby]\$\d{2}\$/.test(String(password || ''));
}

function sanitizeUser(user) {
  if (!user) {
    return null;
  }

  const plainUser = typeof user.get === 'function' ? user.get({ plain: true }) : user;

  return {
    id: plainUser.id,
    firstname: plainUser.firstname,
    lastname: plainUser.lastname,
    email: plainUser.email,
    phone: plainUser.phone,
    location: plainUser.location,
    auth_provider: plainUser.auth_provider,
    email_verified: Boolean(plainUser.email_verified),
    role_id: plainUser.role_id,
    role: plainUser.role
      ? {
          id: plainUser.role.id,
          type: plainUser.role.type,
        }
      : null,
      worker_profile: plainUser.worker_profile || null,
  };

}

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role_id: user.role_id,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function createAdminToken(email) {
  return jwt.sign(
    {
      email,
      isAdmin: true,
      type: 'admin',
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function sanitizeAdmin(email) {
  return {
    email,
    name: 'Binaa Pal Owner',
    role: 'Admin',
  };
}

async function findUserByEmail(email) {
    return User.findOne({
        where: { email },
        include: [
            {
                model: Role,
                as: 'role',
                attributes: ['id', 'type'],
            },
            {
                model: WorkerProfile,
                as: 'worker_profile',
                attributes: ['id', 'bio', 'major'],
                required: false,
            },
        ],
    });
}

async function findUserByPhone(phone) {
  return User.findOne({
    where: { phone },
    attributes: ['id', 'email', 'phone'],
  });
}

async function findUserByGoogleSub(googleSub) {
  return User.findOne({
    where: { google_sub: googleSub },
    include: [
      {
        model: Role,
        as: 'role',
        attributes: ['id', 'type'],
      },
      {
        model: WorkerProfile,
        as: 'worker_profile',
        attributes: ['id', 'bio', 'major'],
        required: false,
      },
    ],
  });
}

async function findUserByIdWithRole(id) {
  return User.findByPk(id, {
    include: [
      {
        model: Role,
        as: 'role',
        attributes: ['id', 'type'],
      },
      {
        model: WorkerProfile,
        as: 'worker_profile',
        attributes: ['id', 'bio', 'major'],
        required: false,
      },
    ],
  });
}

async function getOrCreateRole(type) {
  const [role] = await Role.findOrCreate({
    where: { type },
    defaults: { type },
  });

  return role;
}

function parseWorkerSkills(body, roleType) {
  const primarySkillId = Number(body.primarySkillId);
  const secondarySkillId = Number(body.secondarySkillId);
  const hasSecondarySkill = Number.isInteger(secondarySkillId) && secondarySkillId > 0;
  const requestedSkillIds = normalizeSkillIds([
    primarySkillId,
    secondarySkillId,
    ...(Array.isArray(body.skillIds) ? body.skillIds : []),
  ]);
  const skillExperienceById = new Map();

  if (roleType !== 'Worker') {
    return {
      primarySkillId,
      requestedSkillIds: [],
      skillExperienceById,
    };
  }

  if (!Number.isInteger(primarySkillId) || primarySkillId <= 0) {
    throw createRequestError('الصنعة الأساسية مطلوبة لحساب العامل.');
  }

  const primaryExperienceYears = normalizeExperienceYears(
    body.primaryExperienceYears,
    'خبرة الصنعة الأساسية',
    { required: true }
  );

  skillExperienceById.set(primarySkillId, primaryExperienceYears);

  if (hasSecondarySkill) {
    if (secondarySkillId === primarySkillId) {
      throw createRequestError('الصنعة الثانية يجب أن تكون مختلفة عن الصنعة الأساسية.');
    }

    const secondaryExperienceYears = normalizeExperienceYears(
      body.secondaryExperienceYears,
      'خبرة الصنعة الثانية',
      { required: true }
    );

    skillExperienceById.set(secondarySkillId, secondaryExperienceYears);
  }

  return {
    primarySkillId,
    requestedSkillIds,
    skillExperienceById,
  };
}

async function getWorkerSkillsOrThrow(roleType, requestedSkillIds, primarySkillId) {
  if (roleType !== 'Worker') {
    return {
      selectedSkills: [],
      primarySkill: null,
    };
  }

  const selectedSkills = await Skill.findAll({
    where: { id: requestedSkillIds },
    attributes: ['id', 'skill_name'],
    raw: true,
  });

  if (selectedSkills.length !== requestedSkillIds.length) {
    throw createRequestError('واحدة أو أكثر من الصنعات المختارة غير موجودة.');
  }

  const primarySkill = selectedSkills.find((skill) => Number(skill.id) === primarySkillId);

  if (!primarySkill) {
    throw createRequestError('الصنعة الأساسية مطلوبة لحساب العامل.');
  }

  return {
    selectedSkills,
    primarySkill,
  };
}

async function createWorkerAccountDetails(user, selectedSkills, primarySkill, skillExperienceById, transaction) {
  await WorkerProfile.create({
    user_id: user.id,
    major: primarySkill.skill_name,
  }, { transaction });

  await Worker_Skill.bulkCreate(
    selectedSkills.map((skill) => ({
      worker_id: user.id,
      skill_id: skill.id,
      experience_years: skillExperienceById.get(Number(skill.id)) ?? null,
    })),
    { transaction }
  );
}

function getUniqueConstraintMessage(error) {
  if (error.name !== 'SequelizeUniqueConstraintError') {
    return '';
  }

  const fields = Object.keys(error.fields || {});

  if (fields.includes('phone')) {
    return 'رقم الجوال مسجل بالفعل.';
  }

  if (fields.includes('email')) {
    return 'البريد الإلكتروني مسجل بالفعل.';
  }

  if (fields.includes('google_sub')) {
    return 'حساب Google هذا مربوط بحساب آخر.';
  }

  return 'هذه البيانات مسجلة بالفعل.';
}

function splitGoogleName(payload) {
  const emailName = normalizeEmail(payload.email).split('@')[0] || 'user';
  const fullNameParts = cleanString(payload.name).split(/\s+/).filter(Boolean);
  const firstname = cleanString(payload.given_name) || fullNameParts[0] || emailName;
  const lastname = cleanString(payload.family_name) || fullNameParts.slice(1).join(' ') || firstname;

  return {
    firstname,
    lastname,
  };
}

async function verifyGoogleCredential(credential) {
  if (!googleClient || !GOOGLE_CLIENT_ID) {
    throw createStatusError('تسجيل الدخول عبر Google غير مفعّل بعد. أضف GOOGLE_CLIENT_ID في إعدادات الخادم.', 503);
  }

  if (!credential) {
    throw createRequestError('بيانات Google مطلوبة.');
  }

  let ticket;

  try {
    ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
  } catch (error) {
    throw createStatusError('تعذر التحقق من حساب Google.', 401);
  }

  const payload = ticket.getPayload();
  const email = normalizeEmail(payload?.email);

  if (!payload?.sub || !email) {
    throw createStatusError('استجابة Google غير مكتملة.', 401);
  }

  if (!payload.email_verified) {
    throw createStatusError('يجب أن يكون البريد الإلكتروني موثقا من Google.', 401);
  }

  return {
    googleSub: payload.sub,
    email,
    emailAuthoritative: email.endsWith('@gmail.com') || Boolean(payload.hd),
    ...splitGoogleName(payload),
  };
}

async function register(req, res) {
  let transaction;

  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');
    const firstname = cleanString(req.body.firstname);
    const lastname = cleanString(req.body.lastname);
    const phone = normalizePhone(req.body.phone);
    const location = cleanString(req.body.location);
    const roleType = normalizeUserType(req.body.userType);

    if (!firstname || !lastname || !email || !password || !phone || !location) {
      return res.status(400).json({
        message: 'الاسم الأول، الاسم الثاني، البريد الإلكتروني، كلمة المرور، رقم الجوال، والموقع مطلوبة.',
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'البريد الإلكتروني غير صالح.' });
    }

    validateLocalPhone(phone);

    if (password.length < 6) {
      return res.status(400).json({ message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.' });
    }

    const { primarySkillId, requestedSkillIds, skillExperienceById } = parseWorkerSkills(req.body, roleType);

    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return res.status(409).json({
        code: 'ACCOUNT_ALREADY_EXISTS',
        message: 'هذا الحساب موجود بالفعل. انتقل إلى تسجيل الدخول بدل إنشاء حساب جديد.',
      });
    }

    const existingPhone = await findUserByPhone(phone);

    if (existingPhone) {
      return res.status(409).json({
        code: 'ACCOUNT_ALREADY_EXISTS',
        message: 'رقم الجوال مرتبط بحساب موجود بالفعل. استخدم تسجيل الدخول إلى حسابك الحالي.',
      });
    }

    const { selectedSkills, primarySkill } = await getWorkerSkillsOrThrow(roleType, requestedSkillIds, primarySkillId);
    const role = await getOrCreateRole(roleType);
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const verification = createEmailVerificationState(email);
    transaction = await sequelize.transaction();
    const user = await User.create({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      phone,
      location,
      role_id: role.id,
      auth_provider: 'password',
      email_verified: false,
      email_verification_code_hash: verification.codeHash,
      email_verification_expires_at: verification.expiresAt,
      email_verification_attempts: 0,
      email_verification_sent_at: verification.sentAt,
    }, { transaction });

    if (roleType === 'Worker') {
      await createWorkerAccountDetails(user, selectedSkills, primarySkill, skillExperienceById, transaction);
    }

    const verificationEmail = await sendEmailVerificationCode({
      to: email,
      firstname,
      code: verification.code,
      expiresInMinutes: EMAIL_VERIFICATION_TTL_MINUTES,
    });

    if (!verificationEmail.success) {
      throw createStatusError('تعذر إرسال رمز التحقق إلى بريدك. تأكد من البريد وحاول مرة أخرى.', 503);
    }

    await transaction.commit();
    transaction = null;

    res.status(201).json({
      message: 'أرسلنا رمز تحقق إلى بريدك الإلكتروني. أدخله لإكمال إنشاء الحساب.',
      requiresEmailVerification: true,
      email: maskEmail(email),
    });
  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }

    const uniqueMessage = getUniqueConstraintMessage(error);
    const status = error.statusCode || (uniqueMessage ? 409 : 500);

    res.status(status).json({
      message: status === 500 ? 'Failed to create account.' : (uniqueMessage || error.message),
      ...(status === 500 ? { error: error.message } : {}),
    });
  }
}

async function verifyEmail(req, res) {
  try {
    const email = normalizeEmail(req.body.email);
    const code = normalizeDigits(req.body.code).replace(/\D/g, '');

    if (!isValidEmail(email) || !/^\d{6}$/.test(code)) {
      return res.status(400).json({ message: 'أدخل بريداً صالحاً ورمز تحقق مكوناً من 6 أرقام.' });
    }

    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(400).json({ message: 'رمز التحقق غير صحيح أو انتهت صلاحيته.' });
    }

    if (user.email_verified) {
      const token = createToken(user);

      return res.status(200).json({
        message: 'البريد الإلكتروني موثق بالفعل.',
        token,
        user: sanitizeUser(user),
      });
    }

    const expiresAt = user.email_verification_expires_at
      ? new Date(user.email_verification_expires_at)
      : null;

    if (!user.email_verification_code_hash || !expiresAt || expiresAt.getTime() <= Date.now()) {
      return res.status(410).json({
        code: 'VERIFICATION_CODE_EXPIRED',
        message: 'انتهت صلاحية رمز التحقق. اطلب رمزاً جديداً.',
      });
    }

    if (Number(user.email_verification_attempts || 0) >= EMAIL_VERIFICATION_MAX_ATTEMPTS) {
      return res.status(429).json({
        code: 'VERIFICATION_ATTEMPTS_EXCEEDED',
        message: 'تم تجاوز عدد المحاولات المسموح. اطلب رمزاً جديداً.',
      });
    }

    const submittedHash = hashEmailVerificationCode(email, code);

    if (!verificationHashesMatch(submittedHash, user.email_verification_code_hash)) {
      user.email_verification_attempts = Number(user.email_verification_attempts || 0) + 1;
      await user.save();

      const attemptsLeft = Math.max(
        0,
        EMAIL_VERIFICATION_MAX_ATTEMPTS - user.email_verification_attempts
      );

      return res.status(attemptsLeft > 0 ? 400 : 429).json({
        code: attemptsLeft > 0 ? 'INVALID_VERIFICATION_CODE' : 'VERIFICATION_ATTEMPTS_EXCEEDED',
        message: attemptsLeft > 0
          ? `رمز التحقق غير صحيح. بقيت ${attemptsLeft} محاولات.`
          : 'تم تجاوز عدد المحاولات المسموح. اطلب رمزاً جديداً.',
      });
    }

    user.email_verified = true;
    user.email_verification_code_hash = null;
    user.email_verification_expires_at = null;
    user.email_verification_attempts = 0;
    user.email_verification_sent_at = null;
    await user.save();

    const userWithRole = await findUserByIdWithRole(user.id);
    const token = createToken(userWithRole);

    return res.status(200).json({
      message: 'تم توثيق بريدك وإنشاء الحساب بنجاح.',
      token,
      user: sanitizeUser(userWithRole),
    });
  } catch (error) {
    return res.status(500).json({
      message: 'تعذر التحقق من البريد الإلكتروني.',
      error: error.message,
    });
  }
}

async function resendEmailVerification(req, res) {
  try {
    const email = normalizeEmail(req.body.email);

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'البريد الإلكتروني غير صالح.' });
    }

    const user = await findUserByEmail(email);

    if (!user || user.email_verified) {
      return res.status(200).json({
        message: 'إذا كان الحساب بحاجة إلى توثيق فسيصل رمز جديد إلى بريده.',
      });
    }

    const lastSentAt = user.email_verification_sent_at
      ? new Date(user.email_verification_sent_at).getTime()
      : 0;
    const waitMs = EMAIL_VERIFICATION_RESEND_COOLDOWN_MS - (Date.now() - lastSentAt);

    if (waitMs > 0) {
      return res.status(429).json({
        code: 'VERIFICATION_RESEND_COOLDOWN',
        retryAfterSeconds: Math.ceil(waitMs / 1000),
        message: `انتظر ${Math.ceil(waitMs / 1000)} ثانية قبل طلب رمز جديد.`,
      });
    }

    const verification = createEmailVerificationState(email);
    const verificationEmail = await sendEmailVerificationCode({
      to: email,
      firstname: user.firstname,
      code: verification.code,
      expiresInMinutes: EMAIL_VERIFICATION_TTL_MINUTES,
    });

    if (!verificationEmail.success) {
      return res.status(503).json({
        message: 'تعذر إرسال رمز التحقق حالياً. حاول مرة أخرى لاحقاً.',
      });
    }

    user.email_verification_code_hash = verification.codeHash;
    user.email_verification_expires_at = verification.expiresAt;
    user.email_verification_attempts = 0;
    user.email_verification_sent_at = verification.sentAt;
    await user.save();

    return res.status(200).json({
      message: 'تم إرسال رمز تحقق جديد إلى بريدك الإلكتروني.',
      email: maskEmail(email),
    });
  } catch (error) {
    return res.status(500).json({
      message: 'تعذر إعادة إرسال رمز التحقق.',
      error: error.message,
    });
  }
}

async function googleAuth(req, res) {
  let transaction;

  try {
    const registerIntent = req.body.registerIntent === true || req.body.registerIntent === 'true';
    const completeRegistration = req.body.completeRegistration === true
      || req.body.completeRegistration === 'true';
    const googleProfile = await verifyGoogleCredential(req.body.credential);
    let user = await findUserByGoogleSub(googleProfile.googleSub);

    if (!user) {
      user = await findUserByEmail(googleProfile.email);
    }

    if (user) {
      if (registerIntent) {
        return res.status(409).json({
          code: 'ACCOUNT_ALREADY_EXISTS',
          message: 'حساب Google هذا مسجل بالفعل. انتقل إلى تسجيل الدخول بدل إنشاء حساب جديد.',
        });
      }

      if (user.google_sub && user.google_sub !== googleProfile.googleSub) {
        return res.status(409).json({ message: 'هذا البريد مربوط بحساب Google آخر.' });
      }

      if (!user.google_sub && !googleProfile.emailAuthoritative) {
        const linkPassword = String(req.body.linkPassword || '');
        const storedPassword = user.password || '';
        const passwordMatches = linkPassword && storedPassword
          ? (isBcryptHash(storedPassword)
              ? await bcrypt.compare(linkPassword, storedPassword)
              : linkPassword === storedPassword)
          : false;

        if (!passwordMatches) {
          return res.status(409).json({
            message: 'لحماية حسابك، أدخل كلمة المرور الحالية ثم تابع عبر Google لربط هذا البريد.',
          });
        }
      }

      user.google_sub = googleProfile.googleSub;
      user.email_verified = true;
      user.auth_provider = user.password ? 'password_google' : 'google';

      await user.save();

      const userWithRole = await findUserByIdWithRole(user.id);
      const token = createToken(userWithRole);
      const loginEmail = await sendLoginNotificationEmail({
        to: userWithRole.email,
        firstname: userWithRole.firstname,
        authMethod: 'Google',
      });

      return res.status(200).json({
        message: 'Logged in with Google successfully.',
        isNewUser: false,
        loginEmailSent: Boolean(loginEmail.success),
        token,
        user: sanitizeUser(userWithRole),
      });
    }

    if (!registerIntent) {
      return res.status(404).json({
        message: 'هذا البريد غير مسجل بعد. أنشئ حساب باستخدام Google أولاً.',
      });
    }

    const roleType = normalizeUserType(req.body.userType);
    if (roleType === 'Worker' && !completeRegistration) {
      return res.status(200).json({
        message: 'Google account verified. Complete the worker registration form.',
        onboardingRequired: true,
        googleProfile: {
          firstname: googleProfile.firstname,
          lastname: googleProfile.lastname,
          email: googleProfile.email,
        },
      });
    }

    const firstname = roleType === 'Worker'
      ? (cleanString(req.body.firstname) || googleProfile.firstname)
      : googleProfile.firstname;
    const lastname = roleType === 'Worker'
      ? (cleanString(req.body.lastname) || googleProfile.lastname)
      : googleProfile.lastname;
    const phone = roleType === 'Worker' ? normalizePhone(req.body.phone) : null;
    const location = roleType === 'Worker' ? cleanString(req.body.location) : null;

    if (roleType === 'Worker' && (!firstname || !lastname || !phone || !location)) {
      throw createRequestError('الاسم الأول، الاسم الثاني، رقم الجوال، والموقع مطلوبة لإكمال حساب العامل.');
    }

    if (roleType === 'Worker') {
      validateLocalPhone(phone);

      const existingPhone = await findUserByPhone(phone);

      if (existingPhone) {
        throw createStatusError('رقم الجوال مسجل بالفعل.', 409);
      }
    }

    const { primarySkillId, requestedSkillIds, skillExperienceById } = parseWorkerSkills(req.body, roleType);
    const { selectedSkills, primarySkill } = await getWorkerSkillsOrThrow(roleType, requestedSkillIds, primarySkillId);
    const role = await getOrCreateRole(roleType);

    transaction = await sequelize.transaction();

    const createdUser = await User.create({
      firstname,
      lastname,
      email: googleProfile.email,
      password: null,
      phone,
      location,
      role_id: role.id,
      google_sub: googleProfile.googleSub,
      auth_provider: 'google',
      email_verified: true,
    }, { transaction });

    if (roleType === 'Worker') {
      await createWorkerAccountDetails(createdUser, selectedSkills, primarySkill, skillExperienceById, transaction);
    }

    await transaction.commit();
    transaction = null;

    const userWithRole = await findUserByIdWithRole(createdUser.id);
    const token = createToken(userWithRole);
    const welcomeEmail = await sendWelcomeEmail({
      to: googleProfile.email,
      firstname,
      accountType: roleType,
    });

    return res.status(201).json({
      message: 'Account created with Google successfully.',
      isNewUser: true,
      needsProfileSetup: roleType === 'Worker',
      welcomeEmailSent: Boolean(welcomeEmail.success),
      token,
      user: sanitizeUser(userWithRole),
    });
  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }

    const uniqueMessage = getUniqueConstraintMessage(error);
    const status = error.statusCode || (uniqueMessage ? 409 : 500);

    return res.status(status).json({
      message: status === 500 ? 'Failed to continue with Google.' : (uniqueMessage || error.message),
      ...(status === 500 ? { error: error.message } : {}),
    });
  }
}

async function login(req, res) {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'البريد الإلكتروني غير صالح.' });
    }

    if (email === ADMIN_EMAIL) {
      const adminPasswordMatches = ADMIN_PASSWORD_HASH
        ? await bcrypt.compare(password, ADMIN_PASSWORD_HASH)
        : password === ADMIN_PASSWORD;

      if (!adminPasswordMatches) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }

      const adminToken = createAdminToken(email);

      return res.status(200).json({
        message: 'Admin logged in successfully.',
        token: adminToken,
        admin: sanitizeAdmin(email),
      });
    }

    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (!user.password) {
      return res.status(401).json({ message: 'استخدم تسجيل الدخول عبر Google لهذا الحساب.' });
    }

    const storedPassword = user.password || '';
    const passwordMatches = isBcryptHash(storedPassword)
      ? await bcrypt.compare(password, storedPassword)
      : password === storedPassword;

    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (!user.email_verified) {
      return res.status(403).json({
        code: 'EMAIL_NOT_VERIFIED',
        message: 'يجب توثيق البريد الإلكتروني قبل تسجيل الدخول.',
        requiresEmailVerification: true,
        email: maskEmail(user.email),
      });
    }

    if (!isBcryptHash(storedPassword)) {
      user.password = await bcrypt.hash(password, SALT_ROUNDS);
      await user.save();
    }

    const token = createToken(user);
    const loginEmail = await sendLoginNotificationEmail({
      to: user.email,
      firstname: user.firstname,
      authMethod: 'كلمة المرور',
    });

    res.status(200).json({
      message: 'Logged in successfully.',
      loginEmailSent: Boolean(loginEmail.success),
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to login.',
      error: error.message,
    });
  }
}

async function me(req, res) {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['id', 'type'],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ user: sanitizeUser(user) });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch current user.',
      error: error.message,
    });
  }
}

module.exports = {
  JWT_SECRET,
  getPublicAuthConfig,
  googleAuth,
  login,
  me,
  register,
  resendEmailVerification,
  verifyEmail,
};
