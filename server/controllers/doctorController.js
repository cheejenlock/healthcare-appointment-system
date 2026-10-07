const bcrypt = require('bcryptjs');
const db = require('../config/db');

exports.listDoctors = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT d.doctor_id, d.full_name, d.email, d.specialty,
              d.dept_id, dep.name AS dept_name
       FROM doctor d
       LEFT JOIN department dep ON d.dept_id = dep.dept_id
       ORDER BY d.full_name`
    );
    res.json(rows);
  } catch (err) { next(err); }
};

exports.getDoctor = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT d.doctor_id, d.full_name, d.email, d.specialty,
              d.dept_id, dep.name AS dept_name
       FROM doctor d
       LEFT JOIN department dep ON d.dept_id = dep.dept_id
       WHERE d.doctor_id = $1`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Doctor not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

exports.createDoctor = async (req, res, next) => {
  try {
    const { full_name, email, password, specialty, dept_id } = req.body;
    const hash = await bcrypt.hash(password, 12);
    const { rows } = await db.query(
      `INSERT INTO doctor (full_name, email, password_hash, specialty, dept_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING doctor_id, full_name, email, specialty, dept_id`,
      [full_name, email, hash, specialty, dept_id || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Email already exists' });
    next(err);
  }
};

exports.updateDoctor = async (req, res, next) => {
  try {
    const { full_name, specialty, dept_id } = req.body;
    const { rows } = await db.query(
      `UPDATE doctor
       SET full_name = COALESCE($1, full_name),
           specialty = COALESCE($2, specialty),
           dept_id   = COALESCE($3, dept_id)
       WHERE doctor_id = $4
       RETURNING doctor_id, full_name, email, specialty, dept_id`,
      [full_name, specialty, dept_id, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Doctor not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

exports.deleteDoctor = async (req, res, next) => {
  try {
    const { rowCount } = await db.query(
      `DELETE FROM doctor WHERE doctor_id = $1`,
      [req.params.id]
    );
    if (rowCount === 0) return res.status(404).json({ error: 'Doctor not found' });
    res.status(204).send();
  } catch (err) { next(err); }
};