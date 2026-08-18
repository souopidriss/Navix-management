/**
 * Navix Client — Données simulées Notifications (Espace Client / Entreprise)
 * --------------------------------------------------------------------------
 * PROMPT 058 — 18 notifications fictives au format métier complet,
 * strictement isolées multi-tenant : `companyId` = Transports Express
 * Cameroun. Les références (`resourceId`) correspondent à la flotte client
 * (V-CLT-xxx), aux chauffeurs (CDR-xxx), aux entretiens (CLTMT-xxx), aux
 * trajets (TRP-CLT-xxx) et aux documents (CLTDO-xxx).
 *
 * Le type, la catégorie et la sévérité sont dérivés du scénario `kind`
 * (source unique : NOTIFICATION_KINDS dans ../notifications/constants).
 *
 * Aucune requête HTTP — consommé par clientNotificationService (mode mock).
 */
import { getNotificationKind } from '@/features/notifications/constants';

const DEMO_USER_ID = 'usr_001';

/** Complète une notification brute (type, catégorie, sévérité, statuts). */
const normalize = (notification) => {
  const kind = getNotificationKind(notification.kind);
  const isRead = notification.status !== 'unread';

  return {
    type: kind.type,
    category: kind.category,
    severity: kind.severity,
    isRead,
    readAt: isRead ? (notification.readAt ?? notification.createdAt) : null,
    expiresAt: notification.expiresAt ?? null,
    metadata: notification.metadata ?? {},
    ...notification,
  };
};

const RAW_NOTIFICATIONS = [
  {
    id: 'CLTNF-0001',
    companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2',
    userId: DEMO_USER_ID,
    kind: 'maintenance_due_soon',
    title: 'Maintenance à prévoir',
    message:
      'Le tracteur Volvo FH LT 4467 EF approche du seuil de révision (218 000 km). Planifiez l’entretien.',
    status: 'unread',
    resourceType: 'maintenance',
    resourceId: 'CLTMT-0009',
    createdAt: '2026-08-14T06:05:00.000Z',
    metadata: { nextMileage: 218000, currentMileage: 210300 },
  },
  {
    id: 'CLTNF-0002',
    companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2',
    userId: DEMO_USER_ID,
    kind: 'maintenance_in_progress',
    title: 'Maintenance en cours',
    message:
      'Le Land Cruiser CE 4587 AA est en révision au garage Yaoundé Auto depuis le 12 août.',
    status: 'unread',
    resourceType: 'maintenance',
    resourceId: 'CLTMT-0002',
    createdAt: '2026-08-12T07:35:00.000Z',
    metadata: { workshop: 'Garage Yaoundé Auto' },
  },
  {
    id: 'CLTNF-0003',
    companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2',
    userId: DEMO_USER_ID,
    kind: 'maintenance_critical',
    title: 'Maintenance critique',
    message:
      'La pelle Komatsu CE 8821 UV est immobilisée en atelier (panne hydraulique) — pièces en attente.',
    status: 'unread',
    resourceType: 'maintenance',
    resourceId: 'CLTMT-0013',
    createdAt: '2026-08-03T09:05:00.000Z',
    metadata: { anomaly: 'panne_hydraulique' },
  },
  {
    id: 'CLTNF-0004',
    companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2',
    userId: DEMO_USER_ID,
    kind: 'document_expiring',
    title: 'Document bientôt expiré',
    message:
      'La carte grise du Volvo FH LT 4467 EF expire le 8 août. Renouvelez le document rapidement.',
    status: 'read',
    readAt: '2026-08-01T09:00:00.000Z',
    resourceType: 'document',
    resourceId: 'CLTDO-0006',
    createdAt: '2026-07-25T08:00:00.000Z',
    metadata: { expiryDate: '2026-08-08' },
  },
  {
    id: 'CLTNF-0005',
    companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2',
    userId: DEMO_USER_ID,
    kind: 'insurance_expiring',
    title: 'Assurance à renouveler',
    message:
      'L’assurance du Land Cruiser CE 4587 AA expire le 30 novembre 2026.',
    status: 'unread',
    resourceType: 'document',
    resourceId: 'CLTDO-0004',
    createdAt: '2026-08-10T09:00:00.000Z',
    metadata: { expiryDate: '2026-11-30' },
  },
  {
    id: 'CLTNF-0006',
    companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2',
    userId: DEMO_USER_ID,
    kind: 'inspection_expiring',
    title: 'Visite technique à prévoir',
    message:
      'La visite technique du Hino 500 CE 9034 LM arrive à échéance le 12 octobre 2026.',
    status: 'read',
    readAt: '2026-08-05T10:00:00.000Z',
    resourceType: 'document',
    resourceId: 'CLTDO-0005',
    createdAt: '2026-07-30T09:00:00.000Z',
    metadata: { expiryDate: '2026-10-12' },
  },
  {
    id: 'CLTNF-0007',
    companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2',
    userId: DEMO_USER_ID,
    kind: 'abnormal_consumption',
    title: 'Consommation anormale',
    message:
      'La consommation du Volvo FH (30,2 L/100 km) dépasse le seuil de référence. Vérifiez le véhicule.',
    status: 'unread',
    resourceType: 'fuel',
    resourceId: 'CLTFU-0002',
    createdAt: '2026-08-04T06:50:00.000Z',
    metadata: { consumptionAverage: 30.2, reference: 34 },
  },
  {
    id: 'CLTNF-0008',
    companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2',
    userId: DEMO_USER_ID,
    kind: 'trip_completed',
    title: 'Trajet terminé',
    message:
      'Le trajet TRP-CLT-101 (Douala → Yaoundé) a été clôturé avec succès.',
    status: 'read',
    readAt: '2026-08-03T08:00:00.000Z',
    resourceType: 'trip',
    resourceId: 'TRP-CLT-101',
    createdAt: '2026-08-03T07:55:00.000Z',
    metadata: { distance: 260 },
  },
  {
    id: 'CLTNF-0009',
    companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2',
    userId: DEMO_USER_ID,
    kind: 'trip_started',
    title: 'Trajet démarré',
    message:
      'Le trajet TRP-CLT-102 (Douala → Ngaoundéré) a démarré. Adama Bamba au volant du Volvo FH.',
    status: 'unread',
    resourceType: 'trip',
    resourceId: 'TRP-CLT-102',
    createdAt: '2026-08-15T05:50:00.000Z',
    metadata: { driver: 'Adama Bamba' },
  },
  {
    id: 'CLTNF-0010',
    companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2',
    userId: DEMO_USER_ID,
    kind: 'vehicle_immobilized',
    title: 'Véhicule immobilisé',
    message:
      'Le Isuzu D-Max CE 3698 EF est immobilisé pour remplacement d’embrayage (garage agréé Garoua).',
    status: 'unread',
    resourceType: 'vehicle',
    resourceId: 'V-CLT-105',
    createdAt: '2026-08-13T07:10:00.000Z',
    metadata: { maintenanceId: 'CLTMT-0005' },
  },
  {
    id: 'CLTNF-0011',
    companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2',
    userId: DEMO_USER_ID,
    kind: 'vehicle_in_maintenance',
    title: 'Véhicule en maintenance',
    message:
      'La pelle Komatsu CE 8821 UV est en maintenance depuis le 3 août.',
    status: 'read',
    readAt: '2026-08-04T09:00:00.000Z',
    resourceType: 'vehicle',
    resourceId: 'V-CLT-113',
    createdAt: '2026-08-03T09:00:00.000Z',
    metadata: { maintenanceId: 'CLTMT-0013' },
  },
  {
    id: 'CLTNF-0012',
    companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2',
    userId: DEMO_USER_ID,
    kind: 'document_expired',
    title: 'Document expiré',
    message:
      'La carte grise du Volvo FH LT 4467 EF est expirée. Le document doit être renouvelé sans délai.',
    status: 'unread',
    resourceType: 'document',
    resourceId: 'CLTDO-0006',
    createdAt: '2026-08-09T08:00:00.000Z',
    metadata: { expiryDate: '2026-08-08' },
  },
  {
    id: 'CLTNF-0013',
    companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2',
    userId: DEMO_USER_ID,
    kind: 'maintenance_overdue',
    title: 'Maintenance en retard',
    message:
      'Le contrôle de la boîte de vitesses du Hino 500 était prévu pour le 18 août et n’a pas encore débuté.',
    status: 'unread',
    resourceType: 'maintenance',
    resourceId: 'CLTMT-0017',
    createdAt: '2026-08-19T08:00:00.000Z',
    metadata: { scheduledDate: '2026-08-18' },
  },
  {
    id: 'CLTNF-0014',
    companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2',
    userId: DEMO_USER_ID,
    kind: 'license_expiring',
    title: 'Permis bientôt expiré',
    message:
      'Le permis d’Adama Bamba (catégorie CE) expire le 20 août 2026.',
    status: 'unread',
    resourceType: 'driver',
    resourceId: 'CDR-007',
    createdAt: '2026-08-11T09:00:00.000Z',
    metadata: { licenseExpiryDate: '2026-08-20' },
  },
  {
    id: 'CLTNF-0015',
    companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2',
    userId: DEMO_USER_ID,
    kind: 'assignment_completed',
    title: 'Affectation terminée',
    message:
      'L’affectation temporaire CASG-010 a été clôturée. Le véhicule redevient disponible.',
    status: 'read',
    readAt: '2026-07-28T10:00:00.000Z',
    resourceType: 'assignment',
    resourceId: 'CASG-010',
    createdAt: '2026-07-28T09:30:00.000Z',
    metadata: {},
  },
  {
    id: 'CLTNF-0016',
    companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2',
    userId: DEMO_USER_ID,
    kind: 'invoice_issued',
    title: 'Nouvelle facture disponible',
    message:
      'La facture FAC-2026-0814 (14 500 000 FCFA) est disponible dans « Mes factures ».',
    status: 'unread',
    resourceType: 'invoice',
    resourceId: 'INV-CLT-2026-0814',
    createdAt: '2026-08-14T10:00:00.000Z',
    metadata: { amount: 14500000 },
  },
  {
    id: 'CLTNF-0017',
    companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2',
    userId: DEMO_USER_ID,
    kind: 'report_generated',
    title: 'Rapport disponible',
    message:
      'Le rapport de consommation carburant de juillet 2026 a été généré.',
    status: 'read',
    readAt: '2026-08-01T10:05:00.000Z',
    resourceType: 'report',
    resourceId: 'RPT-CLT-2026-07',
    createdAt: '2026-08-01T10:00:00.000Z',
    metadata: { period: '2026-07' },
  },
  {
    id: 'CLTNF-0018',
    companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2',
    userId: DEMO_USER_ID,
    kind: 'maintenance_due_soon',
    title: 'Contrôle technique à prévoir',
    message:
      'Le contrôle technique du Mitsubishi L200 EN 2345 B est prévu le 28 août 2026.',
    status: 'unread',
    resourceType: 'maintenance',
    resourceId: 'CLTMT-0003',
    createdAt: '2026-08-15T08:00:00.000Z',
    metadata: { scheduledDate: '2026-08-28' },
  },
  {
    id: 'CLTNF-0019',
    companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2',
    userId: DEMO_USER_ID,
    kind: 'finance_deposit',
    title: 'Dépôt effectué',
    message:
      'Un dépôt de 20 000 000 FCFA a été crédité sur votre portefeuille (TRX-2026-0812-008).',
    status: 'read',
    readAt: '2026-08-12T14:30:00.000Z',
    resourceType: 'transaction',
    resourceId: 'TRX-0008',
    createdAt: '2026-08-12T14:10:00.000Z',
    metadata: { amount: 20000000, reference: 'TRX-2026-0812-008' },
  },
  {
    id: 'CLTNF-0020',
    companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2',
    userId: DEMO_USER_ID,
    kind: 'finance_payment',
    title: 'Transaction sortante effectuée',
    message:
      'Le règlement de la facture FAC-2026-0801 (14 500 000 FCFA) a été effectué (TRX-2026-0814-009).',
    status: 'unread',
    resourceType: 'transaction',
    resourceId: 'TRX-0009',
    createdAt: '2026-08-14T09:35:00.000Z',
    metadata: { amount: 14500000, reference: 'TRX-2026-0814-009' },
  },
];

export const MOCK_CLIENT_NOTIFICATIONS = RAW_NOTIFICATIONS.map(normalize);
