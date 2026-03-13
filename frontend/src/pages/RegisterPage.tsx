/**
 * pages/RegisterPage.tsx
 * Thin routing target — delegates all logic to RegisterForm feature component.
 */
import { RegisterForm } from '../features/auth';

export default function RegisterPage() {
  return <RegisterForm />;
}
