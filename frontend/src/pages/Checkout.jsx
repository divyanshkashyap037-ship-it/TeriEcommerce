import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import GlassPanel from '../components/GlassPanel';

// Protected checkout: address form + live summary, one POST creates the order.
export default function Checkout() {
  const { user } = useAuth();
  const { items, clear } = useCart();
  const navigate = useNavigate();
  const [products, setProducts] = useState({});
  const [form, setForm] = useState({ name: user?.name || '', address: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(null);

  const ids = Object.keys(items);

  useEffect(() => {
    if (ids.length === 0) return;
    Promise.all(ids.map((id) => api.get(`/api/products/${id}`).then((r) => r.data).catch(() => null))).then(
      (list) => {
        const map = {};
        for (const p of list) if (p) map[p._id] = p;
        setProducts(map);
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join(',')]);

  const lines = ids.map((id) => ({ ...products[id], qty: items[id] })).filter((l) => l._id);
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.qty, 0);

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/api/orders', {
        items: lines.map((l) => ({ product: l._id, quantity: l.qty })),
        ...form,
      });
      clear();
      setDone(res.data.order);
    } catch (err) {
      setError(err.response?.data?.message || 'Order failed');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="container narrow center">
        <h2>Order placed!</h2>
        <p className="success">Order ID: {done._id}</p>
        <p>Total paid: ₹{done.total}</p>
        <p>
          <Link to="/profile" className="btn" style={{ textDecoration: 'none' }}>
            View in profile
          </Link>{' '}
          <Link to="/shop" className="btn btn-ghost" style={{ textDecoration: 'none' }}>
            Keep shopping
          </Link>
        </p>
      </div>
    );
  }

  if (ids.length === 0) {
    return (
      <div className="container narrow center">
        <h2>Nothing to check out</h2>
        <p>
          <Link to="/shop">Back to shop</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="container narrow">
      <h2>Checkout</h2>
      <GlassPanel>
        <div style={{ marginBottom: 4 }}>
          {lines.map((l) => (
            <p key={l._id}>
              {l.name} × {l.qty} — ₹{l.price * l.qty}
            </p>
          ))}
          <p>
            <strong>Total: ₹{subtotal}</strong>
          </p>
        </div>
      </GlassPanel>
      <div style={{ marginTop: 12 }}>
      <GlassPanel>
      <form onSubmit={onSubmit} className="form">
        <label>
          Full name
          <input name="name" value={form.name} onChange={onChange} autoComplete="name" />
        </label>
        <label>
          Address
          <textarea name="address" value={form.address} onChange={onChange} autoComplete="street-address" />
        </label>
        <label>
          Phone
          <input name="phone" value={form.phone} onChange={onChange} autoComplete="tel" />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="btn" disabled={loading}>
          {loading ? 'Placing order…' : `Place order · ₹${subtotal}`}
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => navigate('/cart')}>
          Back to cart
        </button>
      </form>
      </GlassPanel>
      </div>
    </div>
  );
}
