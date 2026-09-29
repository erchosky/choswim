import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
// La variante de react-router/dom usa flushSync de react-dom para las actualizaciones del router.
import { RouterProvider } from 'react-router/dom';
import { AppErrorBoundary } from './app/AppErrorBoundary';
import { router } from './app/router';
import { queryClient } from './lib/queryClient';
import { startAuthListener } from './store/authStore';
import { useAppStore } from './store/appStore';
import { useThemeStore } from './store/themeStore';
import './styles/index.css';

useThemeStore.getState().hydrate();
startAuthListener();

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  useAppStore.getState().setInstallPrompt(event as never);
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </AppErrorBoundary>
  </React.StrictMode>
);
