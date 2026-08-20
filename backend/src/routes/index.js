import { Router } from 'express';
import config from '../config/index.js';
import healthRoutes from '../modules/health/health.routes.js';
import authRoutes from '../modules/auth/auth.routes.js';
import companyRoutes from '../modules/companies/company.routes.js';
import adminCompanyRoutes from '../modules/companies/admin.routes.js';
import vehicleRoutes from '../modules/vehicles/vehicle.routes.js';
import driverRoutes from '../modules/drivers/driver.routes.js';
import assignmentRoutes from '../modules/assignments/assignment.routes.js';
import tripRoutes from '../modules/trips/trip.routes.js';
import fuelRoutes from '../modules/fuel/fuel.routes.js';
import maintenanceRoutes from '../modules/maintenance/maintenance.routes.js';
import documentRoutes from '../modules/documents/document.routes.js';
import notificationRoutes from '../modules/notifications/notification.routes.js';
import auditRoutes from '../modules/audit/audit.routes.js';
import financeRoutes from '../modules/finance/finance.routes.js';
import invoiceRoutes from '../modules/invoices/invoice.routes.js';
import subscriptionRoutes from '../modules/subscriptions/subscription.routes.js';
import billingRoutes from '../modules/billing/billing.routes.js';
import reportRoutes from '../modules/reports/report.routes.js';
import exportRoutes from '../modules/exports/export.routes.js';
import userRoutes from '../modules/users/user.routes.js';
import roleRoutes from '../modules/roles/role.routes.js';
import permissionRoutes from '../modules/permissions/permission.routes.js';
import agencyRoutes from '../modules/agencies/agency.routes.js';
import dashboardRoutes from '../modules/dashboard/dashboard.routes.js';

const router = Router();

router.use(healthRoutes);
router.use('/auth', authRoutes);
router.use('/companies', companyRoutes);
router.use('/admin/companies', adminCompanyRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/drivers', driverRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/trips', tripRoutes);
router.use('/fuel', fuelRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/documents', documentRoutes);
router.use('/notifications', notificationRoutes);
router.use('/audit-logs', auditRoutes);
router.use('/finance', financeRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/billing', billingRoutes);
router.use('/reports', reportRoutes);
router.use('/exports', exportRoutes);
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);
router.use('/permissions', permissionRoutes);
router.use('/agencies', agencyRoutes);
router.use('/dashboard', dashboardRoutes);

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Navix Management API',
    version: config.api.version,
    docs: `${req.protocol}://${req.get('host')}${config.api.prefix}/health`,
  });
});

export default router;
