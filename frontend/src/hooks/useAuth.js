import { createContext, useContext } from 'react';

// The context object lives here (with its hook) so the provider file only
// exports components — React Fast Refresh keeps working across edits.
export const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}
