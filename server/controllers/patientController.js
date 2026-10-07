const bcrypt = require('bcryptjs');
const db = require('../config/db');

exports.listPatients = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT patient_id, full_name, email, phone, dob, created_at
       FROM patient ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) { next(err); }
};

exports.getPatient = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT patient_id, full_name, email, phone, dob, created_at
       FROM patient WHERE patient_id = $1`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Patient not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

exports.createPatient = async (req, res, next) => {
  try {
    const { full_name, email, password, phone, dob } = req.body;
    const hash = await bcrypt.hash(password, 12);
    const { rows } = await db.query(
      `INSERT INTO patient (full_name, email, password_hash, phone, dob)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING patient_id, full_name, email, phone, dob`,
      [full_name, email, hash, phone || null, dob || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Email already exists' });
    next(err);
  }
};

exports.updatePatient = async (req, res, next) => {
  try {
    const { full_name, phone, dob } = req.body;
    const { rows } = await db.query(
      `UPDATE patient
       SET full_name = COALESCE($1, full_name),
           phone     = COALESCE($2, phone),
           dob       = COALESCE($3, dob)
       WHERE patient_id = $4
       RETURNING patient_id, full_name, email, phone, dob`,
      [full_name, phone, dob, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Patient not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

exports.deletePatient = async (req, res, next) => {
  try {
    const { rowCount } = await db.query(
      `DELETE FROM patient WHERE patient_id = $1`,
      [req.params.id]
    );
    if (rowCount === 0) return res.status(404).json({ error: 'Patient not found' });
    res.status(204).send();
  } catch (err) { next(err); }
};