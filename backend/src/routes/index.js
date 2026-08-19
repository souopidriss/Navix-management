import { Router } from 'express';
import config from '../config/index.js';
import healthRoutes from '../modules/health/health.routes.js';
import authRoutes from '../modules/auth/auth.routes.js';

const router = Router();

router.use(healthRoutes);
router.use('/auth', authRoutes);

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Navix Management API',
    version: config.api.version,
    docs: `${req.protocol}://${req.get('host')}${config.api.prefix}/health`,
  });
});

export default router;
