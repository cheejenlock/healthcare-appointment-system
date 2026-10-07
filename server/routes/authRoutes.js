const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const authController = require('../controllers/authController');
const { handleValidation } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');

router.post(
  '/register/patient',
  [
    body('full_name').trim().isLength({ min: 2, max: 100 }),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
  ],
  handleValidation,
  authController.registerPatient
);

router.post(
  '/register/doctor',
  [
    body('full_name').trim().isLength({ min: 2, max: 100 }),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('specialty').trim().notEmpty(),
  ],
  handleValidation,
  authController.registerDoctor
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
    body('role').isIn(['patient', 'doctor']),
  ],
  handleValidation,
  authController.login
);

router.get('/me', authenticate, authController.me);

module.exports = router;