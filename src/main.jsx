import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from '@/app';
import ThemeProvider from '@/providers/ThemeProvider';
import useAuthStore from '@/features/auth/store/auth.store';
import useThemeStore from '@/store/theme.store';
import { setAccessTokenProvider } from '@/lib/axios';
import { APP_NAME } from '@/config';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@/styles/variables.css';
import '@/styles/globals.css';
import '@/styles/theme.css';

setAccessTokenProvider(() => useAuthStore.getState().accessToken);

document.title = APP_NAME;

useThemeStore.getState().initializeTheme();
document.documentElement.setAttribute('data-bs-theme', useThemeStore.getState().resolvedTheme);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
