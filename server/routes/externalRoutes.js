const express = require('express');
const router = express.Router();

const externalController = require('../controllers/externalController');
const { authenticate } = require('../middleware/auth');

// ---------- OpenFDA (protected) ----------
router.get('/fda/drug', authenticate, externalController.searchDrug);
router.get('/fda/ndc/:ndc', authenticate, externalController.getByNdc);

// ---------- SMS (protected) ----------
router.post('/sms/test', authenticate, externalController.testSms);

// ---------- Google Calendar ----------
// ⚠️ IMPORTANT: /calendar/callback must NOT require JWT
//    because Google's OAuth redirect cannot send our Authorization header.
router.get('/calendar/auth', authenticate, externalController.calendarAuth);
router.get('/calendar/callback', externalController.calendarCallback);  // ← 无 authenticate
router.get('/calendar/status', authenticate, externalController.calendarStatus);
router.post('/calendar/sync/:appointmentId', authenticate, externalController.calendarSync);
router.get('/calendar/events', authenticate, externalController.calendarListEvents);

module.exports = router;