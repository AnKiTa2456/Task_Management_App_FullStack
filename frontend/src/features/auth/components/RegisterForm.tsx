import { useForm } from 'react-hook-form';
import { Link }    from 'react-router-dom';
import { User, Mail, Lock } from 'lucide-react';
import Button  from '../../../components/ui/Button';
import Input   from '../../../components/ui/Input';
import { useAuth }  from '../hooks/useAuth';
import type { RegisterDto } from '../../../types';

export function RegisterForm() {
  const { register: registerUser, isRegistering } = useAuth();
  const { register, handleSubmit, formState: { errors } } =
    useForm<RegisterDto & { confirmPassword: string }>();

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Create account</h2>
        <p className="mt-1 text-sm text-slate-500">Start managing tasks with your team today</p>
      </div>

      <form
        onSubmit={handleSubmit(({ confirmPassword: _confirmPassword, ...data }) => registerUser(data))}
        className="space-y-4"
        noValidate
      >
        <Input
          label="Full name"
          placeholder="Alex Johnson"
          leftIcon={<User size={15} />}
          error={errors.name?.message}
          {...register('name', { required: 'Name is required' })}
        />
        <Input
          label="Email"
          type="text"
          placeholder="you@company.com"
          leftIcon={<Mail size={15} />}
          error={errors.email?.message}
          {...register('email', {
            required: 'Email is required',
            pattern:  { value: /\S+@\S+\.\S+/, message: 'Invalid email' },
          })}
        />
        <Input
          label="Password"
          type="password"
          placeholder="Min 8 characters"
          leftIcon={<Lock size={15} />}
          error={errors.password?.message}
          {...register('password', {
            required:  'Password is required',
            minLength: { value: 8, message: 'Minimum 8 characters' },
            pattern: {
              value:   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
              message: 'Must contain uppercase, lowercase and a number',
            },
          })}
        />
        <Input
          label="Confirm password"
          type="password"
          placeholder="Repeat your password"
          leftIcon={<Lock size={15} />}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: (v, formValues) => v === formValues.password || 'Passwords do not match',
          })}
        />
        <Button type="submit" className="w-full" loading={isRegistering}>Create account</Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-brand-600 hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
