/**
 * Navix Subscriptions — TrialBanner
 * --------------------------------------------------------------------------
 * Bannière d'essai gratuit affichée pour les abonnements en statut
 * « trialing » : jours restants, date de fin et action « Choisir un plan ».
 */
import { Alert, Button } from '@/components/ui';
import { getPlan, getTrialRemainingDays, formatSubscriptionDate } from '../constants';

const TrialBanner = ({ subscription, plan, onUpgrade }) => {
  if (subscription?.status !== 'trialing') return null;

  const planName = plan?.name ?? getPlan(subscription.planId)?.label ?? 'le plan';
  const remaining = getTrialRemainingDays(subscription.trialEndDate);
  const isLastDay = remaining !== null && remaining <= 0;

  return (
    <Alert
      variant={isLastDay ? 'warning' : 'info'}
      icon={isLastDay ? 'bi-hourglass-split' : 'bi-gift'}
      className="mb-4"
    >
      <div className="d-flex flex-wrap align-items-center gap-3">
        <div className="flex-grow-1">
          <strong>Essai gratuit en cours — {isLastDay ? 'dernier jour' : `${remaining} jour${remaining > 1 ? 's' : ''} restant${remaining > 1 ? 's' : ''}`}.</strong>{' '}
          Votre essai du plan {planName} se termine le {formatSubscriptionDate(subscription.trialEndDate)}.
        </div>
        <Button size="sm" icon="bi-box-arrow-in-right" onClick={onUpgrade}>
          Choisir un plan
        </Button>
      </div>
    </Alert>
  );
};

export default TrialBanner;
