import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { logout } from '../features/auth/authSlice';
import { authApi } from '../services/api';
import PageLoader from '../components/shared/PageLoader';

export default function PrivateRoute() {
  const { isAuthenticated, accessToken } = useAppSelector(s => s.auth);
  const dispatch = useAppDispatch();
  // Validate the stored token against the real backend once on mount
  const [validating, setValidating] = useState(isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      setValidating(false);
      return;
    }
    authApi.getMe()
      .then(() => setValidating(false))
      .catch(() => {
        dispatch(logout());
        setValidating(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (validating) return <PageLoader />;
  return <Outlet />;
}
