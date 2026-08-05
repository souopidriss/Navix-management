/**
 * Navix Notifications — AlertService
 * --------------------------------------------------------------------------
 * Description : génération d'alertes automatiques simulées à partir des
 * données mockées des autres modules (entreprises, véhicules, chauffeurs,
 * entretiens, abonnements, facturation). Aucun temps réel : la génération
 * reproduit ce que le backend Express.js / MySQL fera plus tard (tâches
 * planifiées) et que NotificationRealtimeService poussera en temps réel.
 *
 * Règles (ALERT_RULES dans ../constants) :
 *   - entretien bientôt dû / en retard      (maintenance)
 *   - véhicule immobilisé / en entretien    (vehicle)
 *   - carte grise / document bientôt expiré (document)
 *   - permis chauffeur bientôt expiré       (driver)
 *   - limite de plan atteinte / approchée   (subscription)
 *   - facture en retard                     (billing)
 *
 * Méthodes :
 *   generateAlerts()            → exécute toutes les vérifications
 *   checkMaintenanceAlerts()    → entretiens programmés / en retard
 *   checkDocumentAlerts()       → expirations de cartes grises (véhicules)
 *   checkDriverAlerts()         → expirations de permis
 *   checkVehicleAlerts()        → véhicules immobilisés / en entretien
 *   checkSubscriptionAlerts()   → limites de plans (MOCK_USAGE / MOCK_PLAN_LIMITS)
 *   checkBillingAlerts()        → factures en retard
 *   buildAlert(kind, …)         → construit une notification dédiée (dédupliquée)
 */
import { getNotificationKind } from '../constants';
import { getNotificationsCache } from './notificationService';

import { MOCK_COMPANIES } from '@/features/companies/mocks';
import { MOCK_VEHICLES } from '@/features/vehicles/mocks';
import { MOCK_DRIVERS } from '@/features/drivers/mocks';
import { MOCK_MAINTENANCE_RECORDS } from '@/features/maintenance/mocks';
import { MOCK_PLANS, MOCK_PLAN_LIMITS, MOCK_SUBSCRIPTIONS, MOCK_USAGE } from '@/features/subscriptions/mocks';
import { MOCK_INVOICES } from '@/features/billing/mocks';

const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const DEMO_USER_ID = 'usr_001';

/** Génère un identifiant ULID plausible (horodatage + aléa Crockford). */
const generateUlid = () => {
  const time = Date.now().toString(36).toUpperCase().padStart(10, '0').slice(0, 10);
  let random = '';
  for (let i = 0; i < 16; i += 1) {
    random += CROCKFORD[Math.floor(Math.random() * CROCKFORD.length)];
  }
  return `${time}${random}`;
};

const now = () => new Date().toISOString();

const toDateOnly = (value) => (value ? String(value).slice(0, 10) : null);

/** Nombre de jours entre une date ISO/YYYY-MM-DD et aujourd'hui (signé). */
const daysFromToday = (value) => {
  const target = new Date(`${toDateOnly(value)}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
};

const companyNameOf = (companyId) =>
  MOCK_COMPANIES.find((company) => company.id === companyId)?.name ?? '';

const vehicleRef = (vehicle) =>
  `${vehicle.make ?? ''} ${vehicle.model ?? ''} ${vehicle.registrationNumber ?? ''}`.trim();

const planCodeBySubscriptionId = new Map(
  MOCK_SUBSCRIPTIONS.map((subscription) => {
    const plan = MOCK_PLANS.find((item) => item.id === subscription.planId);
    return [subscription.id, plan?.code ?? ''];
  }),
);

/**
 * Construit une notification d'alerte (type/catégorie/sévérité dérivés du
 * kind). Déduplique par signature kind + ressource afin que la génération
 * répétée ne crée pas de doublons.
 * @param {object} options — { kind, companyId, resourceType, resourceId,
 *                            title, message, metadata }
 * @returns {object|null}   — alerte créée (ou null si déjà présente)
 */
export const buildAlert = ({
  kind,
  companyId,
  resourceType = null,
  resourceId = null,
  title,
  message,
  metadata = {},
}) => {
  const signature = `${kind}:${resourceType ?? ''}:${resourceId ?? ''}`;
  const existing = getNotificationsCache().some(
    (item) => `${item.kind}:${item.resourceType ?? ''}:${item.resourceId ?? ''}` === signature,
  );
  if (existing) return null;

  const kindInfo = getNotificationKind(kind);
  const createdAt = now();
  return {
    id: generateUlid(),
    companyId,
    userId: DEMO_USER_ID,
    kind,
    type: kindInfo.type,
    category: kindInfo.category,
    severity: kindInfo.severity,
    title,
    message,
    status: 'unread',
    isRead: false,
    readAt: null,
    resourceType,
    resourceId,
    createdAt,
    expiresAt: null,
    metadata,
  };
};

/** Entretiens bientôt dus (≤ 15 jours) ou en retard (pending uniquement). */
export const checkMaintenanceAlerts = () => {
  const alerts = [];

  MOCK_MAINTENANCE_RECORDS.forEach((record) => {
    if (record.status !== 'planned' && record.status !== 'pending') return;
    const days = daysFromToday(record.scheduledDate);
    if (days === null) return;

    const vehicle = MOCK_VEHICLES.find((item) => item.id === record.vehicleId);
    const vehicleLabel = vehicle ? vehicleRef(vehicle) : 'véhicule';
    const scheduledLabel = toDateOnly(record.scheduledDate);

    if (days < 0 && record.status === 'pending') {
      alerts.push(
        buildAlert({
          kind: 'maintenance_overdue',
          companyId: vehicle?.companyId ?? record.companyId,
          resourceType: 'maintenance',
          resourceId: record.id,
          title: 'Entretien en retard',
          message: `L’entretien du ${vehicleLabel} était programmé le ${scheduledLabel} et n’a pas été effectué.`,
          metadata: { scheduledDate: scheduledLabel },
        }),
      );
    } else if (days >= 0 && days <= 15) {
      alerts.push(
        buildAlert({
          kind: 'maintenance_due_soon',
          companyId: vehicle?.companyId ?? record.companyId,
          resourceType: 'maintenance',
          resourceId: record.id,
          title: days === 0 ? 'Entretien prévu aujourd’hui' : 'Entretien bientôt dû',
          message:
            days === 0
              ? `La révision du ${vehicleLabel} est programmée aujourd’hui.`
              : `La révision du ${vehicleLabel} est programmée le ${scheduledLabel} (dans ${days} j).`,
          metadata: { scheduledDate: scheduledLabel, daysLeft: days },
        }),
      );
    }
  });

  return alerts.filter(Boolean);
};

/** Expirations de cartes grises / documents liés aux véhicules. */
export const checkDocumentAlerts = () => {
  const alerts = [];

  MOCK_VEHICLES.forEach((vehicle) => {
    const days = daysFromToday(vehicle.registrationExpiry);
    if (days === null) return;

    const expiryLabel = toDateOnly(vehicle.registrationExpiry);
    if (days < 0) {
      alerts.push(
        buildAlert({
          kind: 'document_expired',
          companyId: vehicle.companyId,
          resourceType: 'vehicle',
          resourceId: vehicle.id,
          title: 'Carte grise expirée',
          message: `La carte grise du ${vehicleRef(vehicle)} est expirée depuis le ${expiryLabel}.`,
          metadata: { expiresAt: expiryLabel },
        }),
      );
    } else if (days <= 30) {
      alerts.push(
        buildAlert({
          kind: 'document_expiring',
          companyId: vehicle.companyId,
          resourceType: 'vehicle',
          resourceId: vehicle.id,
          title: 'Carte grise bientôt expirée',
          message: `La carte grise du ${vehicleRef(vehicle)} expire le ${expiryLabel} (dans ${days} j).`,
          metadata: { expiresAt: expiryLabel, daysLeft: days },
        }),
      );
    }
  });

  return alerts.filter(Boolean);
};

/** Permis chauffeurs bientôt expirés ou expirés. */
export const checkDriverAlerts = () => {
  const alerts = [];

  MOCK_DRIVERS.forEach((driver) => {
    if (driver.status === 'inactive') return;
    const days = daysFromToday(driver.licenseExpiryDate);
    if (days === null) return;

    const expiryLabel = toDateOnly(driver.licenseExpiryDate);
    const driverName = `${driver.firstName ?? ''} ${driver.lastName ?? ''}`.trim() || 'un chauffeur';

    if (days < 0) {
      alerts.push(
        buildAlert({
          kind: 'license_expired',
          companyId: driver.companyId,
          resourceType: 'driver',
          resourceId: driver.id,
          title: 'Permis de conduire expiré',
          message: `Le permis de conduire de ${driverName} a expiré le ${expiryLabel}. La conduite n’est plus autorisée.`,
          metadata: { expiresAt: expiryLabel },
        }),
      );
    } else if (days <= 30) {
      alerts.push(
        buildAlert({
          kind: 'license_expiring',
          companyId: driver.companyId,
          resourceType: 'driver',
          resourceId: driver.id,
          title: 'Permis de conduire bientôt expiré',
          message: `Le permis de conduire de ${driverName} expire le ${expiryLabel} (dans ${days} j).`,
          metadata: { expiresAt: expiryLabel, daysLeft: days },
        }),
      );
    }
  });

  return alerts.filter(Boolean);
};

/** Véhicules immobilisés ou en entretien. */
export const checkVehicleAlerts = () => {
  const alerts = [];

  MOCK_VEHICLES.forEach((vehicle) => {
    if (vehicle.status === 'out_of_service') {
      alerts.push(
        buildAlert({
          kind: 'vehicle_immobilized',
          companyId: vehicle.companyId,
          resourceType: 'vehicle',
          resourceId: vehicle.id,
          title: 'Véhicule immobilisé',
          message: `Le ${vehicleRef(vehicle)} est hors service. Il ne peut être affecté tant que la remise en état n’est pas effectuée.`,
        }),
      );
    } else if (vehicle.status === 'maintenance') {
      alerts.push(
        buildAlert({
          kind: 'vehicle_in_maintenance',
          companyId: vehicle.companyId,
          resourceType: 'vehicle',
          resourceId: vehicle.id,
          title: 'Véhicule en entretien',
          message: `Le ${vehicleRef(vehicle)} est en atelier. Il sera indisponible jusqu’à la fin de la révision.`,
        }),
      );
    }
  });

  return alerts.filter(Boolean);
};

/** Limites de plans (≥ 80 % avertissement, ≥ 100 % critique). */
export const checkSubscriptionAlerts = () => {
  const alerts = [];
  const usageByCompany = MOCK_USAGE || {};

  MOCK_SUBSCRIPTIONS.forEach((subscription) => {
    if (!['active', 'trialing', 'past_due'].includes(subscription.status)) return;
    const planCode = planCodeBySubscriptionId.get(subscription.id);
    const limits = planCode ? MOCK_PLAN_LIMITS[planCode] : null;
    const usage = usageByCompany[subscription.companyId];
    if (!limits || !usage) return;

    const metrics = [
      { key: 'véhicules', current: usage.vehiclesUsed, max: limits.maxVehicles },
      { key: 'chauffeurs', current: usage.driversUsed, max: limits.maxDrivers },
    ];

    metrics.forEach(({ key, current, max }) => {
      if (!max || !current) return;
      const percent = Math.round((current / max) * 100);
      const company = companyNameOf(subscription.companyId);

      if (percent >= 100) {
        alerts.push(
          buildAlert({
            kind: 'plan_limit_reached',
            companyId: subscription.companyId,
            resourceType: 'subscription',
            resourceId: subscription.id,
            title: 'Limite du plan atteinte',
            message: `${company} utilise ${current} ${key} sur ${max} autorisés (${percent} %). Le dépassement entraînera des frais supplémentaires.`,
            metadata: { metric: key, current, limit: max, usagePercent: percent },
          }),
        );
      } else if (percent >= 80) {
        alerts.push(
          buildAlert({
            kind: 'plan_limit_warning',
            companyId: subscription.companyId,
            resourceType: 'subscription',
            resourceId: subscription.id,
            title: 'Quota du plan bientôt atteint',
            message: `${company} utilise ${current} ${key} sur ${max} autorisés (${percent} %). Anticipez un passage au plan supérieur.`,
            metadata: { metric: key, current, limit: max, usagePercent: percent },
          }),
        );
      }
    });
  });

  return alerts.filter(Boolean);
};

/** Factures en retard de paiement. */
export const checkBillingAlerts = () => {
  const alerts = [];

  MOCK_INVOICES.forEach((invoice) => {
    if (invoice.status !== 'overdue') return;
    const days = daysFromToday(invoice.dueDate);
    if (days === null || days >= 0) return;

    alerts.push(
      buildAlert({
        kind: 'invoice_overdue',
        companyId: invoice.companyId,
        resourceType: 'invoice',
        resourceId: invoice.id,
        title: 'Facture en retard de paiement',
        message: `La facture ${invoice.number} de ${companyNameOf(invoice.companyId)} est en retard depuis le ${toDateOnly(invoice.dueDate)}.`,
        metadata: {
          number: invoice.number,
          amount: invoice.total,
          currency: invoice.currency,
          dueDate: toDateOnly(invoice.dueDate),
        },
      }),
    );
  });

  return alerts.filter(Boolean);
};

/**
 * Exécute toutes les vérifications et injecte les nouvelles alertes dans le
 * cache du NotificationService.
 * @returns {Promise<Array<object>>} — alertes réellement créées
 */
export async function generateAlerts() {
  const checks = [
    checkMaintenanceAlerts,
    checkDocumentAlerts,
    checkDriverAlerts,
    checkVehicleAlerts,
    checkSubscriptionAlerts,
    checkBillingAlerts,
  ];

  const created = checks.flatMap((check) => check()).filter(Boolean);

  if (created.length > 0) {
    const cache = getNotificationsCache();
    created.forEach((alert) => cache.unshift(alert));
  }

  return created.map((alert) => ({ ...alert }));
}

/** Service d'alertes (API stable pour le store et la page). */
export const alertService = {
  generateAlerts,
  checkMaintenanceAlerts,
  checkDocumentAlerts,
  checkDriverAlerts,
  checkVehicleAlerts,
  checkSubscriptionAlerts,
  checkBillingAlerts,
  buildAlert,
};
