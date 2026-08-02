import { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import router from '@/routes';
import LoadingPage from '@/pages/LoadingPage';
import { APP_NAME } from '@/config';

const App = () => (
  <HelmetProvider>
    <Helmet titleTemplate={`%s — ${APP_NAME}`} defaultTitle={APP_NAME} />
    {/* Suspense global : fallback unique LoadingPage pour toutes les routes lazy */}
    <Suspense fallback={<LoadingPage />}>
      <RouterProvider router={router} />
    </Suspense>
    <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
  </HelmetProvider>
);

export default App;
