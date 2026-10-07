const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();

const patientController = require('../controllers/patientController');
const { handleValidation } = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

router.get('/', authenticate, authorize(ROLES.ADMIN, ROLES.DOCTOR), patientController.listPatients);

router.get('/:id',
  [param('id').isInt()],
  handleValidation,
  authenticate,
  patientController.getPatient
);

router.post('/',
  [
    body('full_name').trim().isLength({ min: 2 }),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
  ],
  handleValidation,
  patientController.createPatient
);

router.put('/:id',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.PATIENT),
  patientController.updatePatient
);

router.delete('/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  patientController.deletePatient
);

module.exports = router;