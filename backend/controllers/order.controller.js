const Order = require('../models/Order');
const Product = require('../models/Product');

// POST /api/orders — any logged-in user. Checks stock for every item,
// decrements it, then saves the order. Total is computed server-side
// (never trust a total sent from the frontend).
async function placeOrder(req, res, next) {
  try {
    const { items, name, address, phone } = req.body;

    // Load all products at once, then match cart items to them.
    const ids = items.map((i) => i.product);
    const products = await Product.find({ _id: { $in: ids } });
    const byId = new Map(products.map((p) => [p._id.toString(), p]));

    const orderItems = [];
    let total = 0;
    for (const item of items) {
      const product = byId.get(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.product}` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Not enough stock for ${product.name}` });
      }
      product.stock -= item.quantity;
      await product.save();
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      });
      total += product.price * item.quantity;
    }

    const order = await Order.create({
      user: req.user.id, // identity from the access token, not the body
      items: orderItems,
      total,
      name,
      address,
      phone,
    });
    return res.status(201).json({ message: 'Order placed successfully', order });
  } catch (err) {
    return next(err);
  }
}

// GET /api/orders — the logged-in user's own orders, newest first.
async function myOrders(req, res, next) {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    return res.json({ orders });
  } catch (err) {
    return next(err);
  }
}

module.exports = { placeOrder, myOrders };
