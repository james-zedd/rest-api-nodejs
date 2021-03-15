const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/auth');
const User = require('../models/user');
const isAuth = require('../middleware/is-auth');

// PUT /auth/signup
router.put('/signup', [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .custom((value, { req }) => {
      return User.findOne({ email: value }).then(userDoc => {
        if (userDoc) {
          return Promise.reject('Email address already exitst!');
        }
      })
    })
    .normalizeEmail(),
  body('password')
    .trim()
    .isLength({ min: 5 }),
  body('name')
    .trim()
    .not()
    .isEmpty()
], authController.signup);

// POST /auth/login
router.post('/login', authController.login);

// GET /auth/status
router.get('/status', isAuth, authController.getUserStatus);

// PATCH /auth/updateStatus
router.patch('/updateStatus', isAuth, [
  body('status')
    .trim()
    .not()
    .isEmpty()
], authController.patchUserStatus);

module.exports = router;