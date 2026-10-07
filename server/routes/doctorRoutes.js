const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const doctorController = require('../controllers/doctorController');
const { handleValidation } = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

router.get('/', doctorController.listDoctors);
router.get('/:id', doctorController.getDoctor);

router.post('/',
  [
    body('full_name').trim().notEmpty(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('specialty').trim().notEmpty(),
  ],
  handleValidation,
  authenticate,
  authorize(ROLES.ADMIN),
  doctorController.createDoctor
);

router.put('/:id',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.DOCTOR),
  doctorController.updateDoctor
);

router.delete('/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  doctorController.deleteDoctor
);

module.exports = router;