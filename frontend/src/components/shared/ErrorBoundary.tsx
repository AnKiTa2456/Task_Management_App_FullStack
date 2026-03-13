import { Component, type ReactNode, type ErrorInfo } from 'react';
import Button from '../ui/Button';

interface Props { children: ReactNode; fallback?: ReactNode }
interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  reset = () => this.setState({ hasError: false, error: undefined });

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
        <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
          <span className="text-red-500 text-xl">!</span>
        </div>
        <div>
          <p className="font-semibold text-slate-700">Something went wrong</p>
          <p className="mt-1 text-sm text-slate-500 font-mono">{this.state.error?.message}</p>
        </div>
        <Button variant="outline" size="sm" onClick={this.reset}>Try again</Button>
      </div>
    );
  }
}
