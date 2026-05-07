const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'binaa_pal_dev_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const SALT_ROUNDS = 10;

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

async function findUserByEmail(email) {
  return User.findOne({
    where: { email },
    include: [
      {
        model: Role,
        as: 'role',
        attributes: ['id', 'type'],
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
  login,
  me,
  register,
  sanitizeUser,
};
