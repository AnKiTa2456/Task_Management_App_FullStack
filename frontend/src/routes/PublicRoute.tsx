import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';

export default function PublicRoute() {
  const { isAuthenticated } = useAppSelector(s => s.auth);
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
}
