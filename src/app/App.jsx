import { RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import router from '@/routes';

const App = () => (
  <HelmetProvider>
    <RouterProvider router={router} />
    <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
  </HelmetProvider>
);

export default App;
