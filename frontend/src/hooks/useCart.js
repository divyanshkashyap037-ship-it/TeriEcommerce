import { createContext, useContext } from 'react';

// The context object lives here (with its hook) so the provider file only
// exports components — React Fast Refresh keeps working across edits.
export const CartContext = createContext(null);

export function useCart() {
  return useContext(CartContext);
}
