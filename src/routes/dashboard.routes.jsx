import { lazy } from 'react';
import { Route } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import { ROUTES } from './route.constants';

/**
 * Routes privées du Dashboard.
 * Toutes les pages sont chargées à la demande (React.lazy).
 * Ajouter une future page : créer le fichier dans src/pages/ puis l'importer ici en lazy.
 */
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'));
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
const MaintenanceListPage = lazy(() => import('@/features/maintenance/pages/MaintenanceListPage'));
const MaintenanceDetailsPage = lazy(() => import('@/features/maintenance/pages/MaintenanceDetailsPage'));
const MaintenanceCreatePage = lazy(() => import('@/features/maintenance/pages/MaintenanceCreatePage'));
const MaintenanceEditPage = lazy(() => import('@/features/maintenance/pages/MaintenanceEditPage'));
const MaintenanceCalendarPage = lazy(() => import('@/features/maintenance/pages/MaintenanceCalendarPage'));
const MaintenanceStatisticsPage = lazy(() => import('@/features/maintenance/pages/MaintenanceStatisticsPage'));
const DocumentListPage = lazy(() => import('@/features/documents/pages/DocumentListPage'));
const DocumentDetailsPage = lazy(() => import('@/features/documents/pages/DocumentDetailsPage'));
const DocumentCreatePage = lazy(() => import('@/features/documents/pages/DocumentCreatePage'));
const DocumentEditPage = lazy(() => import('@/features/documents/pages/DocumentEditPage'));
const FileTypesPage = lazy(() => import('@/features/documents/pages/FileTypesPage'));
const AgencyListPage = lazy(() => import('@/features/agencies/pages/AgencyListPage'));
const AgencyDetailsPage = lazy(() => import('@/features/agencies/pages/AgencyDetailsPage'));
const AgencyCreatePage = lazy(() => import('@/features/agencies/pages/AgencyCreatePage'));
const AgencyEditPage = lazy(() => import('@/features/agencies/pages/AgencyEditPage'));
const AgencyStatisticsPage = lazy(() => import('@/features/agencies/pages/AgencyStatisticsPage'));
const SubscriptionListPage = lazy(() => import('@/features/subscriptions/pages/SubscriptionListPage'));
const SubscriptionDetailsPage = lazy(() => import('@/features/subscriptions/pages/SubscriptionDetailsPage'));
const SubscriptionPlansPage = lazy(() => import('@/features/subscriptions/pages/SubscriptionPlansPage'));
const SubscriptionUsagePage = lazy(() => import('@/features/subscriptions/pages/SubscriptionUsagePage'));
const BillingDashboardPage = lazy(() => import('@/features/billing/pages/BillingDashboardPage'));
const BillingHistoryPage = lazy(() => import('@/features/billing/pages/BillingHistoryPage'));
const BillingSettingsPage = lazy(() => import('@/features/billing/pages/BillingSettingsPage'));
const InvoiceListPage = lazy(() => import('@/features/billing/pages/InvoicesPage'));
const InvoiceDetailsPage = lazy(() => import('@/features/billing/pages/InvoiceDetailsPage'));
const PaymentListPage = lazy(() => import('@/features/billing/pages/PaymentsPage'));
const PaymentDetailsPage = lazy(() => import('@/features/billing/pages/PaymentDetailsPage'));
const NotificationsPage = lazy(() => import('@/features/notifications/pages/NotificationsPage'));
const NotificationDetailsPage = lazy(() => import('@/features/notifications/pages/NotificationDetailsPage'));
const AuditLogsPage = lazy(() => import('@/features/audit/pages/AuditLogsPage'));
const AuditLogDetailsPage = lazy(() => import('@/features/audit/pages/AuditLogDetailsPage'));

export const dashboardRoutes = (
  <Route element={<DashboardLayout />}>
    <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
    <Route path={ROUTES.COMPANIES} element={<CompanyListPage />} />
    <Route path={ROUTES.COMPANIES_CREATE} element={<CompanyCreatePage />} />
    <Route path={ROUTES.COMPANIES_DETAIL} element={<CompanyDetailsPage />} />
    <Route path={ROUTES.COMPANIES_EDIT} element={<CompanyEditPage />} />
    <Route path={ROUTES.AGENCIES} element={<AgencyListPage />} />
    <Route path={ROUTES.AGENCIES_CREATE} element={<AgencyCreatePage />} />
    <Route path={ROUTES.AGENCIES_DETAIL} element={<AgencyDetailsPage />} />
    <Route path={ROUTES.AGENCIES_EDIT} element={<AgencyEditPage />} />
    <Route path={ROUTES.AGENCIES_STATISTICS} element={<AgencyStatisticsPage />} />
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
    <Route path={ROUTES.ENTRETIENS} element={<MaintenanceListPage />} />
    <Route path={ROUTES.MAINTENANCE_CALENDAR} element={<MaintenanceCalendarPage />} />
    <Route path={ROUTES.MAINTENANCE_STATISTICS} element={<MaintenanceStatisticsPage />} />
    <Route path={ROUTES.MAINTENANCE_CREATE} element={<MaintenanceCreatePage />} />
    <Route path={ROUTES.MAINTENANCE_DETAIL} element={<MaintenanceDetailsPage />} />
    <Route path={ROUTES.MAINTENANCE_EDIT} element={<MaintenanceEditPage />} />
    <Route path={ROUTES.FILES} element={<DocumentListPage />} />
    <Route path={ROUTES.FILES_CREATE} element={<DocumentCreatePage />} />
    <Route path={ROUTES.FILES_DETAIL} element={<DocumentDetailsPage />} />
    <Route path={ROUTES.FILES_EDIT} element={<DocumentEditPage />} />
    <Route path={ROUTES.FILE_TYPES} element={<FileTypesPage />} />
    <Route path={ROUTES.INVOICES} element={<InvoiceListPage />} />
    <Route path={ROUTES.BILLING} element={<BillingDashboardPage />} />
    <Route path={ROUTES.BILLING_INVOICES} element={<InvoiceListPage />} />
    <Route path={ROUTES.BILLING_INVOICE_DETAIL} element={<InvoiceDetailsPage />} />
    <Route path={ROUTES.BILLING_PAYMENTS} element={<PaymentListPage />} />
    <Route path={ROUTES.BILLING_PAYMENT_DETAIL} element={<PaymentDetailsPage />} />
    <Route path={ROUTES.BILLING_HISTORY} element={<BillingHistoryPage />} />
    <Route path={ROUTES.BILLING_SETTINGS} element={<BillingSettingsPage />} />
    <Route path={ROUTES.SUBSCRIPTIONS} element={<SubscriptionListPage />} />
    <Route path={ROUTES.SUBSCRIPTIONS_PLANS} element={<SubscriptionPlansPage />} />
    <Route path={ROUTES.SUBSCRIPTIONS_USAGE} element={<SubscriptionUsagePage />} />
    <Route path={ROUTES.SUBSCRIPTIONS_DETAIL} element={<SubscriptionDetailsPage />} />
    <Route path={ROUTES.NOTIFICATIONS} element={<NotificationsPage />} />
    <Route path={ROUTES.NOTIFICATIONS_DETAIL} element={<NotificationDetailsPage />} />
    <Route path={ROUTES.AUDIT_LOGS} element={<AuditLogsPage />} />
    <Route path={ROUTES.AUDIT_LOGS_DETAIL} element={<AuditLogDetailsPage />} />
    <Route path={ROUTES.SETTINGS} element={<PlaceholderPage title="Paramètres" icon="bi-gear" />} />
    <Route path={ROUTES.PROFILE} element={<PlaceholderPage title="Profil" icon="bi-person" />} />
  </Route>
);
