/**
 * Navix Subscriptions — SubscriptionTimeline
 * --------------------------------------------------------------------------
 * Chronologie du cycle de vie d'un abonnement (création, essai, changement de
 * plan, suspension, annulation, période courante, renouvellement), construite
 * à partir des horodatages de l'abonnement et du plan. S'appuie sur le
 * composant générique Timeline de Core UI.
 */
import { Timeline } from '@/components/core';
import { getPlan, formatSubscriptionDateTime } from '../constants';

const toDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const SubscriptionTimeline = ({ subscription, plan }) => {
  const planName = plan?.name ?? getPlan(subscription?.planId)?.label ?? 'Plan';

  const events = [
    subscription?.createdAt && {
      id: 'created',
      title: 'Création de l’abonnement',
      description: `Souscription au plan ${planName}.`,
      date: formatSubscriptionDateTime(subscription.createdAt),
      icon: 'bi-plus-circle',
      variant: 'info',
    },
    subscription?.trialStartDate && {
      id: 'trial-start',
      title: 'Début de l’essai gratuit',
      description: `Période d’essai ouverte sur le plan ${planName}.`,
      date: formatSubscriptionDateTime(subscription.trialStartDate),
      icon: 'bi-gift',
      variant: 'primary',
    },
    subscription?.planChangedAt && {
      id: 'plan-change',
      title: 'Changement de plan',
      description: `Passage au plan ${planName}.`,
      date: formatSubscriptionDateTime(subscription.planChangedAt),
      icon: 'bi-arrow-repeat',
      variant: 'warning',
    },
    subscription?.pausedAt && {
      id: 'paused',
      title: 'Suspension de l’abonnement',
      description: 'Le service est suspendu jusqu’à la reprise.',
      date: formatSubscriptionDateTime(subscription.pausedAt),
      icon: 'bi-pause-circle',
      variant: 'secondary',
    },
    subscription?.cancelledAt && {
      id: 'cancelled',
      title: 'Annulation demandée',
      description: 'L’abonnement reste actif jusqu’à la fin de la période.',
      date: formatSubscriptionDateTime(subscription.cancelledAt),
      icon: 'bi-x-circle',
      variant: 'danger',
    },
    subscription?.currentPeriodStart && {
      id: 'period-start',
      title: 'Début de la période courante',
      description: 'Nouvelle période de facturation.',
      date: formatSubscriptionDateTime(subscription.currentPeriodStart),
      icon: 'bi-calendar2-check',
      variant: 'info',
    },
    subscription?.renewalDate && {
      id: 'renewal',
      title: 'Renouvellement prévu',
      description: 'Prochaine échéance de renouvellement.',
      date: formatSubscriptionDateTime(subscription.renewalDate),
      icon: 'bi-arrow-clockwise',
      variant: 'success',
    },
    subscription?.currentPeriodEnd && {
      id: 'period-end',
      title: 'Fin de la période courante',
      description: 'Clôture de la période de facturation en cours.',
      date: formatSubscriptionDateTime(subscription.currentPeriodEnd),
      icon: 'bi-calendar2-x',
      variant: 'secondary',
    },
  ].filter(Boolean);

  const ordered = events
    .map((event) => ({ ...event, order: toDate(event.date) }))
    .sort((a, b) => String(b.order).localeCompare(String(a.order)));

  return <Timeline items={ordered} />;
};

export default SubscriptionTimeline;
