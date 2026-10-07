const db = require('../config/db');
const { APPOINTMENT_STATUS } = require('../config/constants');

exports.listAppointments = async (req, res, next) => {
  try {
    const { role, id } = req.user;
    let sql = `
      SELECT a.appointment_id, a.scheduled_at, a.status, a.notes,
             a.created_at,
             p.patient_id, p.full_name AS patient_name, p.email AS patient_email,
             d.doctor_id, d.full_name AS doctor_name, d.specialty
      FROM appointment a
      JOIN patient p ON a.patient_id = p.patient_id
      JOIN doctor  d ON a.doctor_id  = d.doctor_id
    `;
    const params = [];

    if (role === 'patient') {
      sql += ' WHERE a.patient_id = $1';
      params.push(id);
    } else if (role === 'doctor') {
      sql += ' WHERE a.doctor_id = $1';
      params.push(id);
    }

    sql += ' ORDER BY a.scheduled_at DESC';

    const { rows } = await db.query(sql, params);
    res.json(rows);
  } catch (err) { next(err); }
};

exports.getAppointment = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT a.*, p.full_name AS patient_name, d.full_name AS doctor_name
       FROM appointment a
       JOIN patient p ON a.patient_id = p.patient_id
       JOIN doctor  d ON a.doctor_id  = d.doctor_id
       WHERE a.appointment_id = $1`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Appointment not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

exports.createAppointment = async (req, res, next) => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const { patient_id, doctor_id, scheduled_at, notes } = req.body;

    const patient = await client.query(
      'SELECT patient_id FROM patient WHERE patient_id = $1', [patient_id]
    );
    if (patient.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Patient does not exist' });
    }

    const doctor = await client.query(
      'SELECT doctor_id FROM doctor WHERE doctor_id = $1', [doctor_id]
    );
    if (doctor.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Doctor does not exist' });
    }

    const conflict = await client.query(
      `SELECT appointment_id FROM appointment
       WHERE doctor_id = $1 AND scheduled_at = $2
         AND status IN ('pending','confirmed')`,
      [doctor_id, scheduled_at]
    );
    if (conflict.rowCount > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Doctor already booked at this time' });
    }

    const result = await client.query(
      `INSERT INTO appointment (patient_id, doctor_id, scheduled_at, notes, status)
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING *`,
      [patient_id, doctor_id, scheduled_at, notes || null]
    );

    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

exports.updateAppointment = async (req, res, next) => {
  try {
    const { scheduled_at, status, notes } = req.body;

    if (status && !Object.values(APPOINTMENT_STATUS).includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const { rows } = await db.query(
      `UPDATE appointment
       SET scheduled_at = COALESCE($1, scheduled_at),
           status       = COALESCE($2, status),
           notes        = COALESCE($3, notes)
       WHERE appointment_id = $4
       RETURNING *`,
      [scheduled_at, status, notes, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Appointment not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

exports.deleteAppointment = async (req, res, next) => {
  try {
    const { rowCount } = await db.query(
      'DELETE FROM appointment WHERE appointment_id = $1',
      [req.params.id]
    );
    if (rowCount === 0) return res.status(404).json({ error: 'Appointment not found' });
    res.status(204).send();
  } catch (err) { next(err); }
};