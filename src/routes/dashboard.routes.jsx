import { lazy } from 'react';
import { Route } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import { ROUTES } from './route.constants';

/**
 * Routes privées du Dashboard.
 * Toutes les pages sont chargées à la demande (React.lazy).
 * Ajouter une future page : créer le fichier dans src/pages/ puis l'importer ici en lazy.
 */
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const PlaceholderPage = lazy(() => import('@/pages/PlaceholderPage'));
const CompanyListPage = lazy(() => import('@/features/companies/pages/CompanyListPage'));
const CompanyDetailsPage = lazy(() => import('@/features/companies/pages/CompanyDetailsPage'));
const CompanyCreatePage = lazy(() => import('@/features/companies/pages/CompanyCreatePage'));
const CompanyEditPage = lazy(() => import('@/features/companies/pages/CompanyEditPage'));
const VehicleListPage = lazy(() => import('@/features/vehicles/pages/VehicleListPage'));
const VehicleDetailsPage = lazy(() => import('@/features/vehicles/pages/VehicleDetailsPage'));
const VehicleCreatePage = lazy(() => import('@/features/vehicles/pages/VehicleCreatePage'));
const VehicleEditPage = lazy(() => import('@/features/vehicles/pages/VehicleEditPage'));
const DriverListPage = lazy(() => import('@/features/drivers/pages/DriverListPage'));
const DriverDetailsPage = lazy(() => import('@/features/drivers/pages/DriverDetailsPage'));
const DriverCreatePage = lazy(() => import('@/features/drivers/pages/DriverCreatePage'));
const DriverEditPage = lazy(() => import('@/features/drivers/pages/DriverEditPage'));
const AssignmentListPage = lazy(() => import('@/features/assignments/pages/AssignmentListPage'));
const AssignmentDetailsPage = lazy(() => import('@/features/assignments/pages/AssignmentDetailsPage'));
const AssignmentCreatePage = lazy(() => import('@/features/assignments/pages/AssignmentCreatePage'));
const AssignmentEditPage = lazy(() => import('@/features/assignments/pages/AssignmentEditPage'));
const AssignmentHistoryPage = lazy(() => import('@/features/assignments/pages/AssignmentHistoryPage'));
const TripListPage = lazy(() => import('@/features/trips/pages/TripListPage'));
const TripDetailsPage = lazy(() => import('@/features/trips/pages/TripDetailsPage'));
const TripCreatePage = lazy(() => import('@/features/trips/pages/TripCreatePage'));
const TripEditPage = lazy(() => import('@/features/trips/pages/TripEditPage'));
const TripHistoryPage = lazy(() => import('@/features/trips/pages/TripHistoryPage'));
const FuelListPage = lazy(() => import('@/features/fuel/pages/FuelListPage'));
const FuelDetailsPage = lazy(() => import('@/features/fuel/pages/FuelDetailsPage'));
const FuelCreatePage = lazy(() => import('@/features/fuel/pages/FuelCreatePage'));
const FuelEditPage = lazy(() => import('@/features/fuel/pages/FuelEditPage'));
const FuelStatisticsPage = lazy(() => import('@/features/fuel/pages/FuelStatisticsPage'));

export const dashboardRoutes = (
  <Route element={<DashboardLayout />}>
    <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
    <Route path={ROUTES.COMPANIES} element={<CompanyListPage />} />
    <Route path={ROUTES.COMPANIES_CREATE} element={<CompanyCreatePage />} />
    <Route path={ROUTES.COMPANIES_DETAIL} element={<CompanyDetailsPage />} />
    <Route path={ROUTES.COMPANIES_EDIT} element={<CompanyEditPage />} />
    <Route path={ROUTES.AGENCIES} element={<PlaceholderPage title="Agences" icon="bi-diagram-3" />} />
    <Route path={ROUTES.VEHICLES} element={<VehicleListPage />} />
    <Route path={ROUTES.VEHICLES_CREATE} element={<VehicleCreatePage />} />
    <Route path={ROUTES.VEHICLES_DETAIL} element={<VehicleDetailsPage />} />
    <Route path={ROUTES.VEHICLES_EDIT} element={<VehicleEditPage />} />
    <Route path={ROUTES.DRIVERS} element={<DriverListPage />} />
    <Route path={ROUTES.DRIVERS_CREATE} element={<DriverCreatePage />} />
    <Route path={ROUTES.DRIVERS_DETAIL} element={<DriverDetailsPage />} />
    <Route path={ROUTES.DRIVERS_EDIT} element={<DriverEditPage />} />
    <Route path={ROUTES.ASSIGNMENTS} element={<AssignmentListPage />} />
    <Route path={ROUTES.ASSIGNMENTS_HISTORY} element={<AssignmentHistoryPage />} />
    <Route path={ROUTES.ASSIGNMENTS_CREATE} element={<AssignmentCreatePage />} />
    <Route path={ROUTES.ASSIGNMENTS_DETAIL} element={<AssignmentDetailsPage />} />
    <Route path={ROUTES.ASSIGNMENTS_EDIT} element={<AssignmentEditPage />} />
    <Route path={ROUTES.TRIPS} element={<TripListPage />} />
    <Route path={ROUTES.TRIPS_CREATE} element={<TripCreatePage />} />
    <Route path={ROUTES.TRIPS_DETAIL} element={<TripDetailsPage />} />
    <Route path={ROUTES.TRIPS_EDIT} element={<TripEditPage />} />
    <Route path={ROUTES.TRIPS_HISTORY} element={<TripHistoryPage />} />
    <Route path={ROUTES.FUEL} element={<FuelListPage />} />
    <Route path={ROUTES.FUEL_CREATE} element={<FuelCreatePage />} />
    <Route path={ROUTES.FUEL_DETAIL} element={<FuelDetailsPage />} />
    <Route path={ROUTES.FUEL_EDIT} element={<FuelEditPage />} />
    <Route path={ROUTES.FUEL_STATISTICS} element={<FuelStatisticsPage />} />
    <Route path={ROUTES.ENTRETIENS} element={<PlaceholderPage title="Entretiens" icon="bi-wrench-adjustable" />} />
    <Route path={ROUTES.FILES} element={<PlaceholderPage title="Documents" icon="bi-folder2-open" />} />
    <Route path={ROUTES.INVOICES} element={<PlaceholderPage title="Facturation" icon="bi-receipt" />} />
    <Route path={ROUTES.SUBSCRIPTIONS} element={<PlaceholderPage title="Abonnements" icon="bi-credit-card" />} />
    <Route path={ROUTES.NOTIFICATIONS} element={<PlaceholderPage title="Notifications" icon="bi-bell" />} />
    <Route path={ROUTES.SETTINGS} element={<PlaceholderPage title="Paramètres" icon="bi-gear" />} />
    <Route path={ROUTES.PROFILE} element={<PlaceholderPage title="Profil" icon="bi-person" />} />
  </Route>
);
