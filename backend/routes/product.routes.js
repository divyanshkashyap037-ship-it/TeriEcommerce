const express = require('express');
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  purchaseProduct,
} = require('../controllers/product.controller');
const {
  productCreateValidator,
  productUpdateValidator,
  productIdValidator,
  productListValidator,
  purchaseValidator,
} = require('../validators/product.validator');
const validateRequest = require('../middleware/validation.middleware');
const authenticate = require('../middleware/auth.middleware');
const requireSeller = require('../middleware/role.middleware');

const router = express.Router();

router.get('/', productListValidator, validateRequest, getProducts);
// CORS-clean image proxy: hosts like pinimg/gstatic omit Access-Control-Allow-Origin,
// which WebGL textures require. Must be registered before /:id.
router.get('/image-proxy', async (req, res) => {
  try {
    const target = new URL(String(req.query.url || ''));
    if (target.protocol !== 'http:' && target.protocol !== 'https:') {
      return res.status(400).json({ message: 'Only http(s) images are allowed' });
    }
    const upstream = await fetch(target, {
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
      headers: { Accept: 'image/*', 'User-Agent': 'TeriEcommerce-ImageProxy/1.0' },
    });
    if (!upstream.ok) {
      return res.status(502).json({ message: 'Upstream image failed' });
    }
    const type = upstream.headers.get('content-type') || 'image/jpeg';
    const body = Buffer.from(await upstream.arrayBuffer());
    res.setHeader('Content-Type', type);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.send(body);
  } catch (err) {
    return res.status(502).json({ message: 'Image fetch failed' });
  }
});
router.get('/:id', productIdValidator, validateRequest, getProductById);
// Selling (create/edit/delete) is seller-only. Browsing stays public.
router.post('/', authenticate, requireSeller, productCreateValidator, validateRequest, createProduct);
router.put('/:id', authenticate, requireSeller, productIdValidator, productUpdateValidator, validateRequest, updateProduct);
router.delete('/:id', authenticate, requireSeller, productIdValidator, validateRequest, deleteProduct);
// Buying: any logged-in user. Decrements stock, never below zero.
router.post('/:id/purchase', authenticate, purchaseValidator, validateRequest, purchaseProduct);

module.exports = router;
