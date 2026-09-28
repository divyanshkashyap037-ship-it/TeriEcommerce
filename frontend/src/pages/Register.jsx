import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import GlassPanel from '../components/GlassPanel';

// Turn backend validation errors [{field, message}] into {field: message} map.
function toFieldErrors(data) {
  const map = {};
  if (data?.errors) {
    for (const e of data.errors) map[e.field] = e.message;
  }
  return map;
}

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'buyer' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function onSubmit(e) {
    e.preventDefault();
    // Browsers can autofill without firing React onChange, leaving `form`
    // stale (you see a value, but submit sends ''). Read the real DOM values
    // via FormData first, fall back to state.
    const data = new FormData(e.target);
    const payload = {
      name: (data.get('name') || form.name || '').toString(),
      email: (data.get('email') || form.email || '').toString(),
      password: (data.get('password') || form.password || '').toString(),
      confirmPassword: (data.get('confirmPassword') || form.confirmPassword || '').toString(),
      role: (data.get('role') || form.role || 'buyer').toString(),
    };
    setForm(payload);
    setFieldErrors({});
    setServerError('');
    setLoading(true);
    try {
      await api.post('/api/auth/register', payload);
      setSuccess('Registered successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1000);
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) setFieldErrors(toFieldErrors(data));
      setServerError(data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container narrow">
      <h2>Create account</h2>
      <GlassPanel>
      <form onSubmit={onSubmit} className="form">
        <label>
          Name
          <input name="name" autoComplete="name" value={form.name} onChange={onChange} placeholder="Divyansh" />
          {fieldErrors.name && <small className="error">{fieldErrors.name}</small>}
        </label>
        <label>
          Email
          <input name="email" type="email" autoComplete="email" value={form.email} onChange={onChange} placeholder="you@example.com" />
          {fieldErrors.email && <small className="error">{fieldErrors.email}</small>}
        </label>
        <label>
          Password
          <input name="password" type="password" autoComplete="new-password" value={form.password} onChange={onChange} placeholder="Password123!" />
          {fieldErrors.password && <small className="error">{fieldErrors.password}</small>}
        </label>
        <label>
          Confirm Password
          <input name="confirmPassword" type="password" autoComplete="new-password" value={form.confirmPassword} onChange={onChange} />
          {fieldErrors.confirmPassword && <small className="error">{fieldErrors.confirmPassword}</small>}
        </label>
        <div>
          <span style={{ fontSize: 13, fontWeight: 600 }}>I want to join as</span>
          <div style={{ display: 'flex', gap: 16, marginTop: 6 }}>
            <label style={{ flexDirection: 'row', alignItems: 'center', gap: 6, fontWeight: 400 }}>
              <input
                type="radio"
                name="role"
                value="buyer"
                checked={form.role === 'buyer'}
                onChange={onChange}
              />
              Buyer — I want to buy
            </label>
            <label style={{ flexDirection: 'row', alignItems: 'center', gap: 6, fontWeight: 400 }}>
              <input
                type="radio"
                name="role"
                value="seller"
                checked={form.role === 'seller'}
                onChange={onChange}
              />
              Seller — I want to sell
            </label>
          </div>
          {fieldErrors.role && <small className="error">{fieldErrors.role}</small>}
        </div>

        {serverError && <p className="error">{serverError}</p>}
        {success && <p className="success">{success}</p>}

        <button className="btn" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      </GlassPanel>
      <p className="center">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
