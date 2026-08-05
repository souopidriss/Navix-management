/**
 * Navix Subscriptions — DeleteSubscriptionModal
 * --------------------------------------------------------------------------
 * Modale de suppression définitive d'un abonnement. Confirmation explicite
 * avec identité de l'entreprise, rappel des conséquences (plan inactif) et
 * action irréversible. S'appuie sur le ConfirmDialog générique de Core UI.
 */
import { ConfirmDialog } from '@/components/core';
import { getPlan } from '../constants';

const DeleteSubscriptionModal = ({ open, onClose, subscription, loading, error, onConfirm }) => {
  if (!subscription) return null;

  const planName = getPlan(subscription.planId).label;

  const message = (
    <>
      Vous êtes sur le point de <strong>supprimer définitivement</strong> l’abonnement
      de <strong>{subscription.companyName}</strong> (plan {planName}).
      L’entreprise se retrouvera alors sans abonnement actif et ne pourra plus
      utiliser les fonctionnalités du plan.
    </>
  );

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      title="Supprimer l'abonnement"
      message={message}
      confirmLabel="Supprimer l'abonnement"
      confirmVariant="danger"
      icon="bi-trash"
      size="sm"
      loading={loading}
      error={error}
      onConfirm={onConfirm}
      cancelLabel="Annuler"
    />
  );
};

export default DeleteSubscriptionModal;
