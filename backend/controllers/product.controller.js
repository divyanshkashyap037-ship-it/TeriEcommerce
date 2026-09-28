const Product = require('../models/Product');

// Only these fields may be written from a request body. `seller` is
// deliberately absent: ownership comes from the token, not the client.
const WRITABLE_FIELDS = ['name', 'description', 'price', 'stock', 'category', 'image'];

// Ownership check: a seller may only touch products they created.
function ownsProduct(product, userId) {
  return Boolean(product.seller) && String(product.seller) === String(userId);
}

// POST /api/products — protected
async function createProduct(req, res, next) {
  try {
    const product = await Product.create({ ...req.body, seller: req.user.id });
    return res.status(201).json(product);
  } catch (err) {
    return next(err);
  }
}

// GET /api/products — public, supports ?page=&limit=
async function getProducts(req, res, next) {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Product.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Product.countDocuments(),
    ]);

    return res.json({ page, limit, total, products: items });
  } catch (err) {
    return next(err);
  }
}

// GET /api/products/:id — public (id already validated as ObjectId)
async function getProductById(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.json(product);
  } catch (err) {
    return next(err);
  }
}

// PUT /api/products/:id — protected, owner seller only
async function updateProduct(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (!ownsProduct(product, req.user.id)) {
      return res.status(403).json({ message: 'You can only edit your own products' });
    }
    for (const field of WRITABLE_FIELDS) {
      if (req.body[field] !== undefined) product[field] = req.body[field];
    }
    await product.save(); // triggers Mongoose validation (e.g. no negative price)
    return res.json(product);
  } catch (err) {
    return next(err);
  }
}

// DELETE /api/products/:id — protected, owner seller only
async function deleteProduct(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (!ownsProduct(product, req.user.id)) {
      return res.status(403).json({ message: 'You can only delete your own products' });
    }
    await product.deleteOne();
    return res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    return next(err);
  }
}

// POST /api/products/:id/purchase — any logged-in user (buyer or seller).
// Decrements stock by quantity (default 1). Never lets stock go negative.
async function purchaseProduct(req, res, next) {
  try {
    const quantity = req.body.quantity === undefined ? 1 : req.body.quantity;
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Not enough stock available' });
    }
    product.stock -= quantity;
    await product.save();
    return res.json({ message: 'Purchase successful', product });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  purchaseProduct,
};
