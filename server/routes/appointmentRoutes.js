const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const apptController = require('../controllers/appointmentController');
const { handleValidation } = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

router.use(authenticate);

router.get('/', apptController.listAppointments);
router.get('/:id', apptController.getAppointment);

router.post('/',
  authorize(ROLES.PATIENT, ROLES.ADMIN),
  [
    body('patient_id').isInt(),
    body('doctor_id').isInt(),
    body('scheduled_at').isISO8601(),
  ],
  handleValidation,
  apptController.createAppointment
);

router.put('/:id',
  authorize(ROLES.PATIENT, ROLES.DOCTOR, ROLES.ADMIN),
  apptController.updateAppointment
);

router.delete('/:id',
  authorize(ROLES.PATIENT, ROLES.DOCTOR, ROLES.ADMIN),
  apptController.deleteAppointment
);

module.exports = router;