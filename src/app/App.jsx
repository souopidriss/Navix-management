import { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import router from '@/routes';
import LoadingPage from '@/pages/LoadingPage';

const App = () => (
  <HelmetProvider>
    <Suspense fallback={<LoadingPage />}>
      <RouterProvider router={router} />
    </Suspense>
    <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
  </HelmetProvider>
);

export default App;
