import { createBrowserRouter, Navigate } from 'react-router-dom';
import AuthLayout from '@/layouts/AuthLayout';
import DashboardLayout from '@/layouts/DashboardLayout';
import PublicLayout from '@/layouts/PublicLayout';
import { ProtectedRoute } from '@/components/common';
import PlaceholderPage from '@/pages/PlaceholderPage';
import NotFoundPage from '@/pages/NotFoundPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <PlaceholderPage title="Bienvenue" icon="bi-compass" description="Navix Management, la plateforme de gestion de flotte de véhicules." />,
      },
      {
        path: 'fonctionnalites',
        element: <PlaceholderPage title="Fonctionnalités" icon="bi-stars" />,
      },
      {
        path: 'contact',
        element: <PlaceholderPage title="Contact" icon="bi-envelope-paper" />,
      },
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/auth/login" replace />,
      },
      {
        path: 'login',
        element: <PlaceholderPage title="Connexion" icon="bi-box-arrow-in-right" />,
      },
      {
        path: 'register',
        element: <PlaceholderPage title="Créer un compte" icon="bi-person-plus" />,
      },
    ],
  },
  {
    path: '/dashboard',
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <PlaceholderPage title="Tableau de bord" icon="bi-speedometer2" />,
          },
          {
            path: 'vehicles',
            element: <PlaceholderPage title="Véhicules" icon="bi-truck" />,
          },
          {
            path: 'drivers',
            element: <PlaceholderPage title="Conducteurs" icon="bi-person-badge" />,
          },
          {
            path: 'trips',
            element: <PlaceholderPage title="Trajets" icon="bi-signpost-split" />,
          },
          {
            path: 'maintenance',
            element: <PlaceholderPage title="Maintenance" icon="bi-wrench-adjustable" />,
          },
          {
            path: 'reports',
            element: <PlaceholderPage title="Rapports" icon="bi-clipboard-data" />,
          },
          {
            path: 'settings',
            element: <PlaceholderPage title="Paramètres" icon="bi-gear" />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export default router;
