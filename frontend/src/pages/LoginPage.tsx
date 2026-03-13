/**
 * pages/LoginPage.tsx
 * Thin routing target — delegates all logic to LoginForm feature component.
 */
import { LoginForm } from '../features/auth';

export default function LoginPage() {
  return <LoginForm />;
}
