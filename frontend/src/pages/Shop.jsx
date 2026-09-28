import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import CountUp from '../components/bits/CountUp';
import BranchedMenu from '../components/bits/BranchedMenu';
import GlassPanel from '../components/GlassPanel';
import DeleteButton from '../components/rare/DeleteButton';

function stockClass(stock) {
  if (stock <= 0) return 'stock out';
  if (stock < 5) return 'stock low';
  return 'stock';
}

function stockLabel(stock) {
  if (stock <= 0) return 'Out of stock';
  if (stock < 5) return `Only ${stock} left`;
  return `In stock (${stock})`;
}

// Apple-glass catalog: every panel is the same real GlassSurface as the
// navbar. Sidebar holds the live category tree (BranchedMenu).
export default function Shop() {
  const { isAuthenticated, user } = useAuth();
  const isSeller = user?.role === 'seller';
  // Only the seller who created a product may edit/delete it.
  const ownsProduct = (p) => isSeller && Boolean(p.seller) && p.seller === user?._id;
  const { add } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [buyingId, setBuyingId] = useState(null);
  const [addedId, setAddedId] = useState(null);
  const [category, setCategory] = useState('all');

  // First paint already has loading=true; state only updates after the
  // request resolves, so no synchronous setState happens inside the effect.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await api.get('/api/products');
        if (alive) setProducts(res.data.products || []);
      } catch (err) {
        if (alive) setError(err.response?.data?.message || 'Failed to load products');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  async function handleDelete(id) {
    try {
      await api.delete(`/api/products/${id}`);
      // Update UI without full reload.
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  }

  // Buy one unit right away: backend decrements stock, refuses when empty.
  // No checkout page involved — direct purchase.
  async function handleBuy(id) {
    setBuyingId(id);
    try {
      const res = await api.post(`/api/products/${id}/purchase`, { quantity: 1 });
      setProducts((prev) => prev.map((p) => (p._id === id ? res.data.product : p)));
    } catch (err) {
      alert(err.response?.data?.message || 'Purchase failed');
    } finally {
      setBuyingId(null);
    }
  }

  function handleAdd(id) {
    add(id, 1);
    setAddedId(id);
    setTimeout(() => setAddedId((cur) => (cur === id ? null : cur)), 1200);
  }

  // Live categories straight from the API data — no hardcoded list.
  const categories = useMemo(
    () => ['all', ...new Set(products.map((p) => p.category).filter(Boolean))],
    [products]
  );
  const visible = products.filter((p) => category === 'all' || p.category === category);

  if (loading) return <p className="center">Loading products…</p>;
  if (error) return <p className="center error">{error}</p>;

  const totalStock = products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);

  return (
    <div className="container">
      <GlassPanel>
        <div className="shop-head">
          <h2>Shop all products</h2>
          <p>Everyday store demo. Browse freely{isSeller ? ', manage your catalogue below.' : ' — log in to buy.'}</p>
          <div className="stat-row">
            <div className="stat">
              <b>
                <CountUp to={products.length} duration={1.2} />
              </b>
              <span>products listed</span>
            </div>
            <div className="stat">
              <b>
                <CountUp to={totalStock} duration={1.2} />
              </b>
              <span>units in stock</span>
            </div>
          </div>
        </div>
      </GlassPanel>

      <div className="shop-layout">
        <GlassPanel>
          <div>
            <h4 className="side-title">CATEGORIES</h4>
            <BranchedMenu
              items={[
                {
                  label: 'Shop',
                  children: categories.map((c) => ({
                    value: c,
                    label: c === 'all' ? `All products (${products.length})` : `${c} (${products.filter((p) => p.category === c).length})`,
                  })),
                },
              ]}
              defaultOpen={[0]}
              defaultActive="all"
              onSelect={(value) => setCategory(value)}
              color="#1d3a24"
              accentColor="#2f7d4f"
              lineColor="#b9cec0"
              width={210}
            />
            {isSeller && (
              <p style={{ marginTop: 12 }}>
                <Link to="/products/new" className="btn btn-small" style={{ textDecoration: 'none' }}>
                  + Add product
                </Link>
              </p>
            )}
          </div>
        </GlassPanel>

        <div>
          <div className="page-head">
            <span className="muted">
              {visible.length} item(s){category !== 'all' ? ` in ${category}` : ''}
            </span>
          </div>

          {visible.length === 0 ? (
            <GlassPanel>
              <p className="center">No products{category !== 'all' ? ' in this category' : ' yet'}.</p>
            </GlassPanel>
          ) : (
            <div className="grid">
              {visible.map((p) => (
                <GlassPanel key={p._id} radius={18}>
                  <div className="product">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="product-img" loading="lazy" />
                    ) : (
                      <div className="product-img" style={{ display: 'grid', placeItems: 'center', color: '#9e9e9e' }}>
                        No photo
                      </div>
                    )}
                    <div className="product-body">
                      <div className="product-cat">{p.category}</div>
                      <h3>{p.name}</h3>
                      <p className="product-desc">{p.description}</p>
                      <div className="price-row">
                        <span className="price">₹{p.price}</span>
                        <span className={stockClass(p.stock)}>{stockLabel(p.stock)}</span>
                      </div>
                      {isAuthenticated && p.stock > 0 && (
                        <div className="row">
                          <button
                            className="btn btn-small"
                            disabled={buyingId === p._id}
                            onClick={() => handleBuy(p._id)}
                          >
                            {buyingId === p._id ? 'Buying…' : `Buy now · ₹${p.price}`}
                          </button>
                          <button className="btn btn-small btn-ghost" onClick={() => handleAdd(p._id)}>
                            {addedId === p._id ? 'Added ✓' : 'Add to cart'}
                          </button>
                        </div>
                      )}
                      {!isAuthenticated && p.stock > 0 && (
                        <p className="muted" style={{ marginTop: 10 }}>
                          <Link to="/login">Login</Link> to buy this item
                        </p>
                      )}
                      {ownsProduct(p) && (
                        <div className="row">
                          <Link to={`/products/${p._id}/edit`} className="btn btn-small btn-ghost">
                            Edit
                          </Link>
                          <DeleteButton onConfirm={() => handleDelete(p._id)} />
                        </div>
                      )}
                    </div>
                  </div>
                </GlassPanel>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
