import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 text-center px-4">
      <p className="text-fluid-5xl font-extrabold text-brand-200 select-none">404</p>
      <div>
        <h1 className="text-fluid-2xl font-bold text-slate-800 dark:text-slate-100">Page not found</h1>
        <p className="mt-2 text-fluid-sm text-slate-500 dark:text-slate-400">
          The page you're looking for doesn't exist or was moved.
        </p>
      </div>
      <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
    </div>
  );
}
