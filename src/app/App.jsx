import { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from '@/components/core';
import router from '@/routes';
import LoadingPage from '@/pages/LoadingPage';
import { APP_NAME } from '@/config';

const App = () => (
  <HelmetProvider>
    <Helmet titleTemplate={`%s — ${APP_NAME}`} defaultTitle={APP_NAME} />
    {/* ErrorBoundary global : toute erreur de rendu non gérée affiche une UI
        de repli (réessai + retour dashboard) au lieu d'un écran blanc. */}
    <ErrorBoundary>
      {/* Suspense global : fallback unique LoadingPage pour toutes les routes lazy */}
      <Suspense fallback={<LoadingPage />}>
        <RouterProvider router={router} />
      </Suspense>
    </ErrorBoundary>
    <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
  </HelmetProvider>
);

export default App;
