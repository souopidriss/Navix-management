/**
 * Navix Subscriptions — CancelSubscriptionModal
 * --------------------------------------------------------------------------
 * Modale de résiliation d'un abonnement : l'abonnement reste actif jusqu'à la
 * fin de la période de facturation en cours, puis passe en statut « Annulée ».
 * S'appuie sur le ConfirmDialog générique de Core UI.
 */
import { ConfirmDialog } from '@/components/core';
import { getPlan, formatSubscriptionDate } from '../constants';

const CancelSubscriptionModal = ({ open, onClose, subscription, loading, error, onConfirm }) => {
  if (!subscription) return null;

  const planName = getPlan(subscription.planId).label;

  const message = (
    <>
      Résilier l’abonnement de <strong>{subscription.companyName}</strong> (plan {planName}) ?
      Le service restera actif jusqu’à la fin de la période en cours,
      soit le <strong>{formatSubscriptionDate(subscription.currentPeriodEnd)}</strong>,
      puis passera en statut « Annulée ».
    </>
  );

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      title="Résilier l'abonnement"
      message={message}
      confirmLabel="Résilier l'abonnement"
      confirmVariant="warning"
      icon="bi-x-circle"
      size="sm"
      loading={loading}
      error={error}
      onConfirm={onConfirm}
      cancelLabel="Garder l'abonnement"
    />
  );
};

export default CancelSubscriptionModal;
