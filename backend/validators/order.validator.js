const { body } = require('express-validator');
const mongoose = require('mongoose');

// POST /api/orders — cart items + shipping details, all validated.
const orderCreateValidator = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must have at least one item'),
  body('items.*.product')
    .notEmpty()
    .withMessage('Each item needs a product id')
    .custom((v) => {
      if (!mongoose.Types.ObjectId.isValid(v)) throw new Error('Invalid product ID');
      return true;
    }),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1')
    .toInt(),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
];

module.exports = { orderCreateValidator };
