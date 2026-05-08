const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Role,WorkerProfile } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'binaa_pal_dev_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const SALT_ROUNDS = 10;
const ADMIN_EMAIL = normalizeEmail(process.env.ADMIN_EMAIL || 'admin@binaapal.com');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin12345';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '';

const ROLE_BY_USER_TYPE = {
  client: 'Client',
  worker: 'Worker',
};

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function normalizeUserType(userType) {
  return ROLE_BY_USER_TYPE[String(userType || '').toLowerCase()] || ROLE_BY_USER_TYPE.client;
}

function cleanString(value) {
  return String(value || '').trim();
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

async function getOrCreateRole(type) {
  const [role] = await Role.findOrCreate({
    where: { type },
    defaults: { type },
  });

  return role;
}

async function register(req, res) {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');
    const firstname = cleanString(req.body.firstname);
    const lastname = cleanString(req.body.lastname);
    const phone = cleanString(req.body.phone);
    const location = cleanString(req.body.location);
    const roleType = normalizeUserType(req.body.userType);

    if (!firstname || !lastname || !email || !password || !phone || !location) {
      return res.status(400).json({
        message: 'First name, last name, email, password, phone, and location are required.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return res.status(409).json({ message: 'Email is already registered.' });
    }

    const role = await getOrCreateRole(roleType);
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      phone,
      location,
      role_id: role.id,
    });
    const userWithRole = await User.findByPk(user.id, {
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['id', 'type'],
        },
      ],
    });
    const token = createToken(userWithRole);

    res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: sanitizeUser(userWithRole),
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to create account.',
      error: error.message,
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

    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const storedPassword = user.password || '';
    const passwordMatches = isBcryptHash(storedPassword)
      ? await bcrypt.compare(password, storedPassword)
      : password === storedPassword;

    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (!isBcryptHash(storedPassword)) {
      user.password = await bcrypt.hash(password, SALT_ROUNDS);
      await user.save();
    }

    const token = createToken(user);

    res.status(200).json({
      message: 'Logged in successfully.',
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

async function adminLogin(req, res) {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');

    if (!email || !password) {
      return res.status(400).json({ message: 'Admin email and password are required.' });
    }

    const passwordMatches = ADMIN_PASSWORD_HASH
      ? await bcrypt.compare(password, ADMIN_PASSWORD_HASH)
      : password === ADMIN_PASSWORD;

    if (email !== ADMIN_EMAIL || !passwordMatches) {
      return res.status(401).json({ message: 'Invalid admin email or password.' });
    }

    const token = createAdminToken(email);

    res.status(200).json({
      message: 'Admin logged in successfully.',
      token,
      admin: sanitizeAdmin(email),
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to login as admin.',
      error: error.message,
    });
  }
}

async function adminMe(req, res) {
  res.status(200).json({
    admin: sanitizeAdmin(req.admin.email),
  });
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
  adminLogin,
  adminMe,
  login,
  me,
  register,
  sanitizeUser,
};
