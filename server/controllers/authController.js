const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { ROLES } = require('../config/constants');

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
}

exports.registerPatient = async (req, res, next) => {
  try {
    const { full_name, email, password, phone, dob } = req.body;
    const hash = await bcrypt.hash(password, 12);

    const result = await db.query(
      `INSERT INTO patient (full_name, email, password_hash, phone, dob)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING patient_id, full_name, email, phone, dob`,
      [full_name, email, hash, phone || null, dob || null]
    );

    const patient = result.rows[0];
    const token = signToken({ id: patient.patient_id, email: patient.email, role: ROLES.PATIENT });

    res.status(201).json({ user: patient, role: ROLES.PATIENT, token });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Email already registered' });
    next(err);
  }
};

exports.registerDoctor = async (req, res, next) => {
  try {
    const { full_name, email, password, specialty, dept_id } = req.body;
    const hash = await bcrypt.hash(password, 12);

    const result = await db.query(
      `INSERT INTO doctor (full_name, email, password_hash, specialty, dept_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING doctor_id, full_name, email, specialty, dept_id`,
      [full_name, email, hash, specialty, dept_id || null]
    );

    const doctor = result.rows[0];
    const token = signToken({ id: doctor.doctor_id, email: doctor.email, role: ROLES.DOCTOR });

    res.status(201).json({ user: doctor, role: ROLES.DOCTOR, token });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Email already registered' });
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    const table = role === ROLES.DOCTOR ? 'doctor' : 'patient';
    const idCol = role === ROLES.DOCTOR ? 'doctor_id' : 'patient_id';

    const result = await db.query(
      `SELECT ${idCol} AS id, full_name, email, password_hash FROM ${table} WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken({ id: user.id, email: user.email, role });

    res.json({
      user: { id: user.id, full_name: user.full_name, email: user.email },
      role,
      token,
    });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    const { id, role } = req.user;
    const table = role === ROLES.DOCTOR ? 'doctor' : 'patient';
    const idCol = role === ROLES.DOCTOR ? 'doctor_id' : 'patient_id';

    const result = await db.query(
      `SELECT ${idCol} AS id, full_name, email FROM ${table} WHERE ${idCol} = $1`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    res.json({ user: result.rows[0], role });
  } catch (err) {
    next(err);
  }
};