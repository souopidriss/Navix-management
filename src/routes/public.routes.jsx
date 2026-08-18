import { lazy } from 'react';
import { Route } from 'react-router-dom';
import PublicLayout from '@/layouts/PublicLayout';
import { ROUTES } from './route.constants';

/**
 * Routes publiques — Site vitrine.
 * Toutes les pages sont chargées à la demande (React.lazy) :
 * le fallback global <LoadingPage /> (App.jsx, Suspense) s'affiche pendant le chargement.
 */
const MaintenancePage = lazy(() => import('@/pages/MaintenancePage'));
const HomePage = lazy(() => import('@/pages/public/HomePage'));
const FeaturesPage = lazy(() => import('@/pages/public/FeaturesPage'));
const PricingPage = lazy(() => import('@/pages/public/PricingPage'));
const AboutPage = lazy(() => import('@/pages/public/AboutPage'));
const ResourcesPage = lazy(() => import('@/pages/public/ResourcesPage'));
const ContactPage = lazy(() => import('@/pages/public/ContactPage'));

export const publicRoutes = (
  <>
    <Route path={ROUTES.HOME} element={<PublicLayout />}>
      <Route index element={<HomePage />} />
      <Route path="fonctionnalites" element={<FeaturesPage />} />
      <Route path="tarifs" element={<PricingPage />} />
      <Route path="a-propos" element={<AboutPage />} />
      <Route path="ressources" element={<ResourcesPage />} />
      <Route path="contact" element={<ContactPage />} />
    </Route>
    <Route path={ROUTES.MAINTENANCE} element={<MaintenancePage />} />
  </>
);
