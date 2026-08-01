import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from '@/app';
import useAuthStore from '@/store/auth.store';
import { setAccessTokenProvider } from '@/lib/axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@/styles/variables.css';
import '@/styles/globals.css';
import '@/styles/theme.css';

setAccessTokenProvider(() => useAuthStore.getState().token);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
