import { useEffect, useState } from 'react';
import { CartContext } from '../hooks/useCart';

// Cart holds only { productId: quantity }. Product details (price, stock)
// are always re-fetched from the API, so checkout never trusts stale data.
const KEY = 'teri-cart';

function read() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
    if (raw && typeof raw === 'object') {
      const clean = {};
      for (const [id, qty] of Object.entries(raw)) {
        if (typeof qty === 'number' && qty > 0) clean[id] = Math.floor(qty);
      }
      return clean;
    }
  } catch {}
  return {};
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(read);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  function add(id, qty = 1) {
    setItems((prev) => ({ ...prev, [id]: (prev[id] || 0) + qty }));
  }

  function setQty(id, qty) {
    setItems((prev) => {
      if (qty <= 0) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: qty };
    });
  }

  function remove(id) {
    setItems((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function clear() {
    setItems({});
  }

  const count = Object.values(items).reduce((sum, q) => sum + q, 0);
  return (
    <CartContext.Provider value={{ items, add, setQty, remove, clear, count }}>
      {children}
    </CartContext.Provider>
  );
}
