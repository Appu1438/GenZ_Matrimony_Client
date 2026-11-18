import { useContext } from 'react';
import { AdminAuthContext } from '../../context/admin/AdminAuthContext';

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an <AdminAuthContext.Provider>.');
  }
  return ctx;
}

export default useAdminAuth;
