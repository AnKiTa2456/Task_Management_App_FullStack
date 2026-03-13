import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';

export default function PrivateRoute() {
  const { isAuthenticated } = useAppSelector(s => s.auth);
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
