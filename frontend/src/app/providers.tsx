import type { ReactNode } from 'react';
import { Provider }    from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { Toaster }     from 'react-hot-toast';
import { store }       from './store';
import { queryClient } from '../lib/queryClient';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: { borderRadius: '10px', background: '#1e293b', color: '#f1f5f9', fontSize: '13px' },
            }}
          />
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  );
}
