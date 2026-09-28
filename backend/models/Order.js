const mongoose = require('mongoose');

// One order = one checkout. Items snapshot name+price so later
// product edits don't rewrite history. Status stays simple.
const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: {
      type: [orderItemSchema],
      validate: [(v) => v.length > 0, 'Order must have at least one item'],
    },
    total: { type: Number, required: true, min: 0 },
    name: { type: String, required: [true, 'Name is required'], trim: true },
    address: { type: String, required: [true, 'Address is required'], trim: true },
    phone: { type: String, required: [true, 'Phone is required'], trim: true },
    status: { type: String, enum: ['placed', 'cancelled'], default: 'placed' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
