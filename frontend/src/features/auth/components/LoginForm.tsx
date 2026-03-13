import { useForm } from 'react-hook-form';
import { Link }    from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import Button  from '../../../components/ui/Button';
import Input   from '../../../components/ui/Input';
import { useAuth }   from '../hooks/useAuth';
import type { LoginDto } from '../../../types';

export function LoginForm() {
  const { login, isLoggingIn } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginDto>();

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Welcome back</h2>
        <p className="mt-1 text-sm text-slate-500">Sign in to your TaskFlow account</p>
      </div>

      <form onSubmit={handleSubmit(data => login(data))} className="space-y-4" noValidate>
        <Input
          label="Email" type="text" placeholder="you@company.com"
          leftIcon={<Mail size={15} />}
          error={errors.email?.message}
          {...register('email', {
            required: 'Email is required',
            pattern:  { value: /\S+@\S+\.\S+/, message: 'Invalid email' },
          })}
        />
        <Input
          label="Password" type="password" placeholder="••••••••"
          leftIcon={<Lock size={15} />}
          error={errors.password?.message}
          {...register('password', {
            required:  'Password is required',
            minLength: { value: 6, message: 'Minimum 6 characters' },
          })}
        />
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-xs text-brand-600 hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="w-full" loading={isLoggingIn}>Sign in</Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Don't have an account?{' '}
        <Link to="/register" className="font-medium text-brand-600 hover:underline">Create one</Link>
      </p>
    </div>
  );
}
