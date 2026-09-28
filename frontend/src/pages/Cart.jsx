import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../hooks/useCart';
import GlassPanel from '../components/GlassPanel';

// Cart page is public. Details are re-fetched so prices/stock are fresh.
export default function Cart() {
  const { items, setQty, remove } = useCart();
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);

  const ids = Object.keys(items);

  useEffect(() => {
    if (ids.length === 0) {
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all(ids.map((id) => api.get(`/api/products/${id}`).then((r) => r.data).catch(() => null)))
      .then((list) => {
        const map = {};
        for (const p of list) if (p) map[p._id] = p;
        setProducts(map);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join(',')]);

  const subtotal = ids.reduce((sum, id) => sum + (products[id]?.price || 0) * items[id], 0);

  if (loading) return <p className="center">Loading cart…</p>;

  if (ids.length === 0) {
    return (
      <div className="container narrow center">
        <h2>Your cart is empty</h2>
        <p>
          <Link to="/shop" className="btn" style={{ textDecoration: 'none' }}>
            Browse shop
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="container narrow">
      <h2>Your cart</h2>
      <div className="stack">
      {ids.map((id) => {
        const p = products[id];
        if (!p) return null; // product deleted since adding — skipped from total too
        return (
          <GlassPanel key={id}>
            <div>
              <h3 style={{ margin: '0 0 4px' }}>{p.name}</h3>
              <p className="muted">
                ₹{p.price} each · {p.stock} in stock
              </p>
              <div className="row">
                <button className="btn btn-small btn-ghost" onClick={() => setQty(id, items[id] - 1)}>
                  −
                </button>
                <span>{items[id]}</span>
                <button
                  className="btn btn-small btn-ghost"
                  disabled={items[id] >= p.stock}
                  onClick={() => setQty(id, items[id] + 1)}
                  title={items[id] >= p.stock ? 'No more stock' : 'Add one more'}
                >
                  +
                </button>
                <button className="btn btn-small btn-ghost" onClick={() => remove(id)}>
                  Remove
                </button>
              </div>
            </div>
          </GlassPanel>
        );
      })}
      </div>
      <div style={{ marginTop: 12 }}>
      <GlassPanel>
        <div>
          <p>
            <strong>Subtotal: ₹{subtotal}</strong>
          </p>
          <Link to="/checkout" className="btn" style={{ textDecoration: 'none' }}>
            Proceed to checkout
          </Link>
        </div>
      </GlassPanel>
      </div>
    </div>
  );
}
