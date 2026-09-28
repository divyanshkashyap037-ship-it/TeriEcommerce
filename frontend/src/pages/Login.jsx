import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import GlassPanel from '../components/GlassPanel';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function onSubmit(e) {
    e.preventDefault();
    // Same autofill guard as Register: read DOM values first.
    const data = new FormData(e.target);
    const email = (data.get('email') || form.email || '').toString();
    const password = (data.get('password') || form.password || '').toString();
    setForm({ email, password });
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/products');
    } catch (err) {
      // Backend uses generic message: "Invalid email or password"
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container narrow">
      <h2>Login</h2>
      <GlassPanel>
      <form onSubmit={onSubmit} className="form">
        <label>
          Email
          <input name="email" type="email" autoComplete="email" value={form.email} onChange={onChange} placeholder="you@example.com" />
        </label>
        <label>
          Password
          <input name="password" type="password" autoComplete="current-password" value={form.password} onChange={onChange} />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="btn" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      </GlassPanel>
      <p className="center">
        No account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}
