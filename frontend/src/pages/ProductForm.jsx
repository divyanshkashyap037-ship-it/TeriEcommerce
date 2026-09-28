import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import GlassPanel from '../components/GlassPanel';

// Shared form for Add (/products/new) and Edit (/products/:id/edit).
// If `id` param exists -> edit mode: load product then PUT, else POST.
export default function ProductForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    image: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    async function fetchProduct() {
      try {
        const res = await api.get(`/api/products/${id}`);
        const p = res.data;
        // Ownership is enforced by the backend too — this just fails fast.
        if (p.seller && user?._id && p.seller !== user._id) {
          setError('You can only edit your own products');
          return;
        }
        setForm({
          name: p.name || '',
          description: p.description || '',
          price: p.price ?? '',
          stock: p.stock ?? '',
          category: p.category || '',
          image: p.image || '',
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load product');
      } finally {
        setFetching(false);
      }
    }
    fetchProduct();
  }, [id, isEdit, user?._id]);

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setFieldErrors({});
    setError('');
    setLoading(true);
    // Convert price/stock to numbers before sending.
    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
    };
    try {
      if (isEdit) {
        await api.put(`/api/products/${id}`, payload);
      } else {
        await api.post('/api/products', payload);
      }
      navigate('/products');
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) {
        const map = {};
        for (const fe of data.errors) map[fe.field] = fe.message;
        setFieldErrors(map);
      }
      setError(data?.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  }

  if (fetching) return <p className="center">Loading product...</p>;

  // Edit failed before load (not found, or not ours) -> show the reason only.
  if (isEdit && error && !form.name) {
    return (
      <div className="container narrow">
        <h2>Edit Product</h2>
        <p className="error">{error}</p>
        <p>
          <Link to="/shop">Back to shop</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="container narrow">
      <h2>{isEdit ? 'Edit Product' : 'Add Product'}</h2>
      <GlassPanel>
      <form onSubmit={onSubmit} className="form">
        <label>
          Name
          <input name="name" value={form.name} onChange={onChange} />
          {fieldErrors.name && <small className="error">{fieldErrors.name}</small>}
        </label>
        <label>
          Description
          <textarea name="description" value={form.description} onChange={onChange} />
          {fieldErrors.description && <small className="error">{fieldErrors.description}</small>}
        </label>
        <label>
          Price
          <input name="price" type="number" min="0" step="any" value={form.price} onChange={onChange} />
          {fieldErrors.price && <small className="error">{fieldErrors.price}</small>}
        </label>
        <label>
          Stock
          <input name="stock" type="number" min="0" step="1" value={form.stock} onChange={onChange} />
          {fieldErrors.stock && <small className="error">{fieldErrors.stock}</small>}
        </label>
        <label>
          Category
          <input name="category" value={form.category} onChange={onChange} />
          {fieldErrors.category && <small className="error">{fieldErrors.category}</small>}
        </label>
        <label>
          Image URL (optional)
          <input name="image" value={form.image} onChange={onChange} placeholder="https://..." />
          {fieldErrors.image && <small className="error">{fieldErrors.image}</small>}
        </label>

        {error && <p className="error">{error}</p>}
        <button className="btn" disabled={loading}>
          {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
        </button>
      </form>
      </GlassPanel>
    </div>
  );
}
