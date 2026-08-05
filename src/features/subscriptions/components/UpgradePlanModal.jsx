/**
 * Navix Subscriptions — UpgradePlanModal
 * --------------------------------------------------------------------------
 * Modale de changement de plan (upgrade / downgrade simulé) : sélection du
 * nouveau plan parmi les offres, aperçu du prix et confirmation. S'appuie sur
 * le ConfirmDialog générique de Core UI.
 */
import { useEffect, useState } from 'react';
import { ConfirmDialog } from '@/components/core';
import { getPlan, formatSubscriptionMoney, getBillingInterval, MONTHS_PER_BILLING_INTERVAL } from '../constants';
import './UpgradePlanModal.css';

const UpgradePlanModal = ({ open, onClose, subscription, plans = [], loading, error, onConfirm }) => {
  const currentPlanId = subscription?.planId;
  const [selectedPlanId, setSelectedPlanId] = useState(currentPlanId || '');

  useEffect(() => {
    if (open) setSelectedPlanId(currentPlanId || '');
  }, [open, currentPlanId]);

  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId);

  const message = (
    <div className="navix-upgrade-modal">
      <p className="navix-upgrade-modal__intro">
        Choisissez le nouveau plan pour <strong>{subscription?.companyName}</strong>.
      </p>
      <fieldset className="navix-upgrade-modal__options">
        <legend className="visually-hidden">Sélectionner un plan</legend>
        {plans.map((plan) => {
          const meta = getPlan(plan.code);
          const isCurrent = plan.id === currentPlanId;
          const price =
            subscription?.billingInterval === 'yearly'
              ? Number(plan.price) * MONTHS_PER_BILLING_INTERVAL.yearly * 0.833
              : plan.price;

          return (
            <label
              key={plan.id}
              className={`navix-upgrade-modal__option ${isCurrent ? 'navix-upgrade-modal__option--current' : ''} ${
                selectedPlanId === plan.id ? 'navix-upgrade-modal__option--selected' : ''
              }`}
            >
              <input
                type="radio"
                name="plan-select"
                value={plan.id}
                checked={selectedPlanId === plan.id}
                disabled={isCurrent}
                onChange={() => setSelectedPlanId(plan.id)}
              />
              <span className={`navix-upgrade-modal__icon navix-upgrade-modal__icon--${meta.variant}`} aria-hidden="true">
                <i className={`bi ${meta.icon}`} />
              </span>
              <span className="navix-upgrade-modal__option-body">
                <span className="navix-upgrade-modal__option-name">
                  {plan.name}
                  {plan.isPopular && <i className="bi bi-star-fill navix-upgrade-modal__popular" aria-label="Populaire" />}
                  {isCurrent && <span className="navix-upgrade-modal__current-badge">Plan actuel</span>}
                </span>
                <span className="navix-upgrade-modal__option-price">
                  {formatSubscriptionMoney(Math.round(price), plan.currency)} /{' '}
                  {getBillingInterval(subscription?.billingInterval || plan.billingInterval).label.toLowerCase()}
                </span>
              </span>
            </label>
          );
        })}
      </fieldset>
      {selectedPlan && selectedPlanId !== currentPlanId && (
        <p className="navix-upgrade-modal__summary">
          Passage au plan <strong>{selectedPlan.name}</strong> (tarif mensuel :{' '}
          {formatSubscriptionMoney(selectedPlan.price, selectedPlan.currency)}).
        </p>
      )}
    </div>
  );

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      title="Changer de plan"
      message={message}
      confirmLabel="Changer de plan"
      confirmVariant="primary"
      icon="bi-arrow-repeat"
      size="md"
      loading={loading}
      error={error}
      onConfirm={() => onConfirm?.(selectedPlanId)}
      cancelLabel="Annuler"
    />
  );
};

export default UpgradePlanModal;
