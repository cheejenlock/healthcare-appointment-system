const fdaService = require('../services/fdaService');
const googleAuth = require('../services/googleAuthService');
const calendarService = require('../services/calendarService');
const smsService = require('../services/smsService');
const db = require('../config/db');

// ============================================
// OpenFDA
// ============================================

/**
 * GET /api/external/fda/drug?name=amoxicillin
 */
exports.searchDrug = async (req, res, next) => {
  try {
    const { name, limit } = req.query;
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: 'Query param "name" is required (min 2 chars)' });
    }

    const results = await fdaService.searchDrug(name, Math.min(Number(limit) || 5, 10));

    res.json({
      source: 'OpenFDA',
      query: name,
      count: results.length,
      results,
    });
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({ error: 'No drug found for that name' });
    }
    next(err);
  }
};

/**
 * GET /api/external/fda/ndc/:ndc
 */
exports.getByNdc = async (req, res, next) => {
  try {
    const data = await fdaService.getByNdc(req.params.ndc);
    if (!data) return res.status(404).json({ error: 'NDC not found' });
    res.json({ source: 'OpenFDA', result: data });
  } catch (err) {
    next(err);
  }
};

// ============================================
// SMS test
// ============================================

exports.testSms = async (req, res, next) => {
  try {
    const { to, message } = req.body;
    if (!to || !message) {
      return res.status(400).json({ error: 'Body must contain "to" and "message"' });
    }
    const result = await smsService.sendSms(to, message);
    res.json({ source: 'SMS', result });
  } catch (err) {
    next(err);
  }
};

// ============================================
// Google Calendar Integration
// ============================================

/**
 * GET /api/external/calendar/auth
 */
exports.calendarAuth = async (req, res, next) => {
  try {
    const url = googleAuth.getAuthUrl();
    res.json({
      message: 'Visit this URL in your browser to authorize Google Calendar',
      authUrl: url,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/external/calendar/callback
 */
exports.calendarCallback = async (req, res, next) => {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).json({ error: 'Missing code' });

    await googleAuth.exchangeCode(code);

    res.json({
      message: 'Google Calendar authorized successfully. You can now sync appointments.',
      authorized: true,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/external/calendar/status
 */
exports.calendarStatus = async (req, res) => {
  res.json({ authorized: googleAuth.isAuthorized() });
};

/**
 * POST /api/external/calendar/sync/:appointmentId
 */
exports.calendarSync = async (req, res, next) => {
  try {
    const { appointmentId } = req.params;

    const { rows } = await db.query(
      `SELECT a.appointment_id, a.scheduled_at, a.status, a.notes,
              p.full_name AS patient_name, p.email AS patient_email,
              d.full_name AS doctor_name, d.specialty
       FROM appointment a
       JOIN patient p ON a.patient_id = p.patient_id
       JOIN doctor  d ON a.doctor_id  = d.doctor_id
       WHERE a.appointment_id = $1`,
      [appointmentId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const result = await calendarService.createCalendarEvent(rows[0]);

    if (result.error) {
      return res.status(401).json(result);
    }

    res.json({ source: 'GoogleCalendar', appointment: rows[0].appointment_id, event: result });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/external/calendar/events
 */
exports.calendarListEvents = async (req, res, next) => {
  try {
    const result = await calendarService.listUpcomingEvents(5);
    if (result.error) return res.status(401).json(result);
    res.json({ source: 'GoogleCalendar', count: result.length, events: result });
  } catch (err) {
    next(err);
  }
};