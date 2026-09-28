const { body, param, query } = require('express-validator');
const mongoose = require('mongoose');

function isValidObjectId(value) {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error('Invalid product ID');
  }
  return true;
}

const productCreateValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price')
    .exists()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a number and not negative')
    .toFloat(),
  body('stock')
    .exists()
    .withMessage('Stock is required')
    .isInt({ min: 0 })
    .withMessage('Stock must be a whole number and not negative')
    .toInt(),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('image')
    .optional({ values: 'falsy' })
    .isURL()
    .withMessage('Image must be a valid URL'),
];

// For PUT: all fields optional, but if supplied they must be valid.
// Also reject empty name if name is supplied.
const productUpdateValidator = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty'),
  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Description cannot be empty'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a number and not negative')
    .toFloat(),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a whole number and not negative')
    .toInt(),
  body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category cannot be empty'),
  body('image')
    .optional({ values: 'falsy' })
    .isURL()
    .withMessage('Image must be a valid URL'),
];

const productIdValidator = [
  param('id').custom(isValidObjectId),
];

// POST /api/products/:id/purchase — id in params, optional quantity in body.
const purchaseValidator = [
  param('id').custom(isValidObjectId),
  body('quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1')
    .toInt(),
];

// Optional pagination validation for GET /api/products?page=1&limit=10
const productListValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive number')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),
];

module.exports = {
  productCreateValidator,
  productUpdateValidator,
  productIdValidator,
  productListValidator,
  purchaseValidator,
};
