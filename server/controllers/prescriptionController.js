const db = require('../config/db');

exports.listPrescriptions = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT pr.*, a.scheduled_at, a.patient_id, a.doctor_id
       FROM prescription pr
       JOIN appointment a ON pr.appointment_id = a.appointment_id
       ORDER BY pr.issued_at DESC`
    );
    res.json(rows);
  } catch (err) { next(err); }
};

exports.getPrescription = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM prescription WHERE prescription_id = $1',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Prescription not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

exports.getByAppointment = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM prescription WHERE appointment_id = $1 ORDER BY issued_at DESC',
      [req.params.appointmentId]
    );
    res.json(rows);
  } catch (err) { next(err); }
};

exports.createPrescription = async (req, res, next) => {
  try {
    const {
      appointment_id, medication_name, dosage,
      frequency, duration_days, fda_ndc_code,
    } = req.body;

    const { rows } = await db.query(
      `INSERT INTO prescription
         (appointment_id, medication_name, dosage, frequency, duration_days, fda_ndc_code)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [appointment_id, medication_name, dosage, frequency, duration_days, fda_ndc_code || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23503') return res.status(400).json({ error: 'Appointment does not exist' });
    next(err);
  }
};

exports.updatePrescription = async (req, res, next) => {
  try {
    const { medication_name, dosage, frequency, duration_days } = req.body;
    const { rows } = await db.query(
      `UPDATE prescription
       SET medication_name = COALESCE($1, medication_name),
           dosage          = COALESCE($2, dosage),
           frequency       = COALESCE($3, frequency),
           duration_days   = COALESCE($4, duration_days)
       WHERE prescription_id = $5
       RETURNING *`,
      [medication_name, dosage, frequency, duration_days, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Prescription not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

exports.deletePrescription = async (req, res, next) => {
  try {
    const { rowCount } = await db.query(
      'DELETE FROM prescription WHERE prescription_id = $1',
      [req.params.id]
    );
    if (rowCount === 0) return res.status(404).json({ error: 'Prescription not found' });
    res.status(204).send();
  } catch (err) { next(err); }
};