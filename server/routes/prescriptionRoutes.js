const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const prController = require('../controllers/prescriptionController');
const { handleValidation } = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

router.use(authenticate);

router.get('/', prController.listPrescriptions);
router.get('/:id', prController.getPrescription);
router.get('/appointment/:appointmentId', prController.getByAppointment);

router.post('/',
  authorize(ROLES.DOCTOR, ROLES.ADMIN),
  [
    body('appointment_id').isInt(),
    body('medication_name').trim().notEmpty(),
    body('dosage').trim().notEmpty(),
    body('frequency').trim().notEmpty(),
    body('duration_days').isInt({ min: 1 }),
  ],
  handleValidation,
  prController.createPrescription
);

router.put('/:id',
  authorize(ROLES.DOCTOR, ROLES.ADMIN),
  prController.updatePrescription
);

router.delete('/:id',
  authorize(ROLES.DOCTOR, ROLES.ADMIN),
  prController.deletePrescription
);

module.exports = router;