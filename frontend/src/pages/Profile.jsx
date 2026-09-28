import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import GlassPanel from '../components/GlassPanel';

// Protected profile: account details, role, logout, own order history.
export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/api/orders')
      .then((res) => setOrders(res.data.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="container narrow">
      <h2>Profile</h2>
      <GlassPanel>
        <div style={{ marginBottom: 4 }}>
          <p>
            <strong>{user?.name}</strong> ({user?.role})
          </p>
          <p className="muted">{user?.email}</p>
          <div className="row">
            {user?.role === 'seller' ? (
              <Link to="/products/new" className="btn btn-small" style={{ textDecoration: 'none' }}>
                Sell a product
              </Link>
            ) : (
              <Link to="/shop" className="btn btn-small" style={{ textDecoration: 'none' }}>
                Shop now
              </Link>
            )}
            <button className="btn btn-small btn-ghost" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </GlassPanel>

      <h3>Your orders</h3>
      {loading ? (
        <p className="muted">Loading orders…</p>
      ) : orders.length === 0 ? (
        <p className="muted">No orders yet.</p>
      ) : (
        <div className="stack">
          {orders.map((o) => (
          <GlassPanel key={o._id}>
            <div style={{ marginBottom: 4 }}>
              <p className="muted">{new Date(o.createdAt).toLocaleString()} · {o.status}</p>
              {o.items.map((it, i) => (
                <p key={i}>
                  {it.name} × {it.quantity} — ₹{it.price * it.quantity}
                </p>
              ))}
              <p>
                <strong>Total: ₹{o.total}</strong>
              </p>
              <p className="muted">
                {o.name} · {o.address} · {o.phone}
              </p>
            </div>
          </GlassPanel>
          ))}
        </div>
      )}
    </div>
  );
}
