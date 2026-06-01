import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { disconnectDashboardSocket } from '../services/dashboardSocket';
import toast from 'react-hot-toast';
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  canAccess,
} from '../auth/permissions';

const AuthContext = createContext(null);

const ADMIN_ROLES = ['SUPER_ADMIN', 'MEDICAL_ADMIN', 'INSURANCE_STAFF', 'SUPPORT_STAFF', 'ACCOUNTANT'];

export function AuthProvider({ children }) {
  const { t } = useTranslation();
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const refreshProfile = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setUser(null);
      return null;
    }
    const res = await api.get('/auth/me');
    const profile = res.data.data;
    setUser(profile);
    localStorage.setItem('user', JSON.stringify(profile));
    return profile;
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      refreshProfile()
        .catch(() => {
          localStorage.clear();
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [refreshProfile]);

  const permissions = user?.permissions ?? [];

  const can = useCallback(
    (permission) => hasPermission(permissions, permission),
    [permissions],
  );

  const canAny = useCallback(
    (...keys) => hasAnyPermission(permissions, keys),
    [permissions],
  );

  const canAll = useCallback(
    (...keys) => hasAllPermissions(permissions, keys),
    [permissions],
  );

  const canRoute = useCallback(
    (opts) => canAccess({ permissions, role: user?.role }, opts),
    [permissions, user?.role],
  );

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { identifier: email, password });
      const { accessToken, refreshToken } = res.data.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      const profile = await refreshProfile();
      if (!ADMIN_ROLES.includes(profile?.role)) {
        localStorage.clear();
        setUser(null);
        toast.error(t('messages.unauthorized'));
        return;
      }

      toast.success(t('messages.login_success'));
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || t('messages.login_error'));
      throw error;
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      await api.post('/auth/logout', { refreshToken });
    } catch {} finally {
      disconnectDashboardSocket();
      localStorage.clear();
      setUser(null);
      navigate('/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        isAuthenticated: !!user,
        permissions,
        can,
        canAny,
        canAll,
        canRoute,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export default useAuth;
