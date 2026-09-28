const { body } = require('express-validator');

// Shared password rule: min 8 chars, 1 upper, 1 lower, 1 number, 1 symbol.
const strongPassword = body('password')
  .exists({ checkFalsy: true })
  .withMessage('Password is required')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters')
  .matches(/[A-Z]/)
  .withMessage('Password must contain an uppercase letter')
  .matches(/[a-z]/)
  .withMessage('Password must contain a lowercase letter')
  .matches(/[0-9]/)
  .withMessage('Password must contain a number')
  .matches(/[^A-Za-z0-9]/)
  .withMessage('Password must contain a special character');

const registerValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be 2-50 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(), // lowercase, removes dots quirks for gmail etc.
  strongPassword,
  body('confirmPassword')
    .exists({ checkFalsy: true })
    .withMessage('Confirm password is required')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Confirm password must match password');
      }
      return true;
    }),
  // Role is optional at register (defaults to buyer). Must be buyer/seller.
  body('role')
    .optional({ values: 'falsy' })
    .isIn(['buyer', 'seller'])
    .withMessage('Role must be buyer or seller'),
];

const loginValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

module.exports = { registerValidator, loginValidator };
