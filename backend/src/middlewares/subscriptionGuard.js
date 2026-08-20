import subscriptionRepository from '../repositories/SubscriptionRepository.js';

export async function subscriptionGuard(req, res, next) {
  try {
    if (req.user && req.user.role === 'super_admin') {
      return next();
    }

    const companyId = req.tenantId;
    if (!companyId) {
      return next();
    }

    const sub = await subscriptionRepository.findActiveByCompanyId(companyId);
    if (!sub) {
      return next();
    }

    if (sub.status === 'cancelled' || sub.status === 'expired') {
      return res.status(403).json({
        success: false,
        message: 'Votre abonnement ne permet pas cette action. Veuillez vérifier votre statut d\'abonnement.',
        code: 'SUBSCRIPTION_INACTIVE',
      });
    }

    if (sub.status === 'paused') {
      return res.status(403).json({
        success: false,
        message: 'Votre abonnement est suspendu. Veuillez le réactiver pour continuer.',
        code: 'SUBSCRIPTION_PAUSED',
      });
    }

    req.subscription = {
      id: sub.id,
      status: sub.status,
      planCode: sub.plan_code,
    };

    next();
  } catch {
    next();
  }
}
