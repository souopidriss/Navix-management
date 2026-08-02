import { Route } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import DashboardPage from '@/pages/DashboardPage';
import PlaceholderPage from '@/pages/PlaceholderPage';
import { ROUTES } from './route.constants';

export const dashboardRoutes = (
  <Route element={<DashboardLayout />}>
    <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
    <Route path={ROUTES.COMPANIES} element={<PlaceholderPage title="Entreprises" icon="bi-buildings" />} />
    <Route path={ROUTES.AGENCIES} element={<PlaceholderPage title="Agences" icon="bi-diagram-3" />} />
    <Route path={ROUTES.VEHICLES} element={<PlaceholderPage title="Véhicules" icon="bi-truck" />} />
    <Route path={ROUTES.DRIVERS} element={<PlaceholderPage title="Chauffeurs" icon="bi-person-badge" />} />
    <Route path={ROUTES.ASSIGNMENTS} element={<PlaceholderPage title="Affectations" icon="bi-shuffle" />} />
    <Route path={ROUTES.TRIPS} element={<PlaceholderPage title="Trajets" icon="bi-signpost-split" />} />
    <Route path={ROUTES.FUEL} element={<PlaceholderPage title="Carburant" icon="bi-fuel-pump" />} />
    <Route path={ROUTES.ENTRETIENS} element={<PlaceholderPage title="Entretiens" icon="bi-wrench-adjustable" />} />
    <Route path={ROUTES.FILES} element={<PlaceholderPage title="Documents" icon="bi-folder2-open" />} />
    <Route path={ROUTES.INVOICES} element={<PlaceholderPage title="Facturation" icon="bi-receipt" />} />
    <Route path={ROUTES.SUBSCRIPTIONS} element={<PlaceholderPage title="Abonnements" icon="bi-credit-card" />} />
    <Route path={ROUTES.NOTIFICATIONS} element={<PlaceholderPage title="Notifications" icon="bi-bell" />} />
    <Route path={ROUTES.SETTINGS} element={<PlaceholderPage title="Paramètres" icon="bi-gear" />} />
    <Route path={ROUTES.PROFILE} element={<PlaceholderPage title="Profil" icon="bi-person" />} />
  </Route>
);
