import { Router } from 'express';
import config from '../config/index.js';
import healthRoutes from '../modules/health/health.routes.js';
import authRoutes from '../modules/auth/auth.routes.js';
import companyRoutes from '../modules/companies/company.routes.js';
import adminCompanyRoutes from '../modules/companies/admin.routes.js';

const router = Router();

router.use(healthRoutes);
router.use('/auth', authRoutes);
router.use('/companies', companyRoutes);
router.use('/admin/companies', adminCompanyRoutes);

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Navix Management API',
    version: config.api.version,
    docs: `${req.protocol}://${req.get('host')}${config.api.prefix}/health`,
  });
});

export default router;
