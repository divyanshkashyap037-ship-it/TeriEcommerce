const express = require('express');
const { placeOrder, myOrders } = require('../controllers/order.controller');
const { orderCreateValidator } = require('../validators/order.validator');
const validateRequest = require('../middleware/validation.middleware');
const authenticate = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', authenticate, myOrders);
router.post('/', authenticate, orderCreateValidator, validateRequest, placeOrder);

module.exports = router;
