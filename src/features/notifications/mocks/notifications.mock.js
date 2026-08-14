/**
 * Navix Notifications — Données simulées (mode mock)
 * --------------------------------------------------------------------------
 * 42 notifications fictives au format métier complet : id (ULID), companyId,
 * userId, kind (scénario), type, category, severity, title, message, status,
 * isRead, readAt, resourceType, resourceId, createdAt, expiresAt, metadata.
 *
 * Les références (companyId, vehicleId, driverId, maintenanceId, tripId,
 * assignmentId, invoiceId, paymentId, subscriptionId) correspondent
 * exactement aux mocks des modules Entreprises, Véhicules, Chauffeurs,
 * Entretiens, Trajets, Affectations, Facturation et Abonnements. Les dates
 * sont centrées sur août 2026 (aujourd'hui : 5 août 2026).
 *
 * Le type, la catégorie et la sévérité sont dérivés du scénario `kind`
 * (source unique : NOTIFICATION_KINDS dans ../constants).
 *
 * Aucune requête HTTP — consommé par notificationService (mode mock).
 */
import { getNotificationKind } from '../constants';

const DEMO_USER_ID = 'usr_001';

/**
 * Complète une notification brute : type, catégorie, sévérité (dérivés du
 * kind), statuts cohérents (isRead, readAt) et dates par défaut.
 */
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
    id: '01JNE1F2G3H4J5K6L7M8N9P0Q1R2',
    companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2', // Navix Trans
    userId: DEMO_USER_ID,
    kind: 'user_suspended',
    title: 'Utilisateur suspendu',
    message:
      'Le compte de Kader Traoré (Chauffeur) a été suspendu pour non-respect des consignes de sécurité.',
    status: 'unread',
    resourceType: null,
    resourceId: null,
    createdAt: '2026-08-07T09:20:00.000Z',
    metadata: { userRole: 'driver', reason: 'non_respect_consignes' },
  },
  {
    id: '01JNE2G3H4J5K6L7M8N9P0Q1R2S3',
    companyId: '01J8J2K3L4M5N6P7Q8R9S0T1U2', // Douala Cars
    userId: DEMO_USER_ID,
    kind: 'maintenance_critical',
    title: 'Maintenance critique requise',
    message:
      'Le moteur du BYD K6 QR-3345-AB présente une anomalie critique. Le véhicule doit être immobilisé jusqu’à l’expertise.',
    status: 'unread',
    resourceType: 'vehicle',
    resourceId: '01J9J2K3L4M5N6P7Q8R9S0T1U3',
    createdAt: '2026-08-07T08:05:00.000Z',
    metadata: { anomaly: 'surchauffe_moteur' },
  },
  {
    id: '01JNE3H4J5K6L7M8N9P0Q1R2S3T4',
    companyId: '01J8K2L3M4N5P6Q7R8S9T0U1V2', // Sahel Express
    userId: DEMO_USER_ID,
    kind: 'unusual_activity',
    title: 'Activité inhabituelle détectée',
    message:
      'Plusieurs tentatives de connexion échouées ont été relevées sur le compte Sahel Express depuis une IP inconnue.',
    status: 'unread',
    resourceType: null,
    resourceId: null,
    createdAt: '2026-08-06T22:45:00.000Z',
    metadata: { attempts: 5, ip: '196.12.44.7' },
  },
  {
    id: '01JNE4J5K6L7M8N9P0Q1R2S3T4U5',
    companyId: '01J8E2F3G4H5J6K7L8M9N0P1Q2', // Nord Express
    userId: DEMO_USER_ID,
    kind: 'subscription_expired',
    title: 'Abonnement Starter expiré',
    message:
      'L’abonnement Starter de Nord Express est arrivé à échéance. Renouvelez pour conserver l’accès aux véhicules.',
    status: 'unread',
    resourceType: 'subscription',
    resourceId: '01JS5E6F7G8H9J0K1L2M3N4P5Q6',
    createdAt: '2026-08-06T18:10:00.000Z',
  },
  {
    id: '01JNE5K6L7M8N9P0Q1R2S3T4U5V6',
    companyId: '01J8D2E3F4G5H6J7K8L9M0N1P2', // Kribi Port Trans
    userId: DEMO_USER_ID,
    kind: 'role_changed',
    title: 'Rôle modifié',
    message:
      'Le rôle de Fatou Diallo est passé de « Gestionnaire de flotte » à « Administrateur » sur Kribi Port Trans.',
    status: 'unread',
    resourceType: null,
    resourceId: null,
    createdAt: '2026-08-06T15:30:00.000Z',
    metadata: { previousRole: 'fleet_manager', newRole: 'company_admin' },
  },
  {
    id: '01JNE6L7M8N9P0Q1R2S3T4U5V6W7',
    companyId: '01J8F2G3H4J5K6L7M8N9P0Q1R2', // Ouest Logistique
    userId: DEMO_USER_ID,
    kind: 'admin_action',
    title: 'Action administrative',
    message:
      'Une exportation du journal d’audit (juillet 2026) a été réalisée par Awa Kouamé.',
    status: 'read',
    readAt: '2026-08-06T11:00:00.000Z',
    resourceType: null,
    resourceId: null,
    createdAt: '2026-08-06T10:55:00.000Z',
    metadata: { action: 'audit.export', period: '2026-07' },
  },
  {
    id: '01JNE7M8N9P0Q1R2S3T4U5V6W7X8',
    companyId: '01J8B2C3D4E5F6G7H8J9K0L1M2', // Cameroon Express
    userId: DEMO_USER_ID,
    kind: 'fuel_price_high',
    title: 'Prix du carburant élevé',
    message:
      'Le prix moyen du carburant (612 FCFA/L) dépasse de 8 % la moyenne régionale. Ajustez les prévisions de coûts.',
    status: 'read',
    readAt: '2026-08-06T09:00:00.000Z',
    resourceType: null,
    resourceId: null,
    createdAt: '2026-08-06T07:40:00.000Z',
    metadata: { price: 612, deviationPercent: 8, currency: 'XAF' },
  },
  {
    id: '01JNE8N9P0Q1R2S3T4U5V6W7X8Y9',
    companyId: '01J8G2H3J4K5L6M7N8P9Q0R1S2', // Littoral Transport
    userId: DEMO_USER_ID,
    kind: 'vehicle_available',
    title: 'Véhicule disponible',
    message:
      'Le Peugeot 3008 MN-5602-WX est de nouveau disponible après remise en état complète.',
    status: 'read',
    readAt: '2026-08-05T17:30:00.000Z',
    resourceType: 'vehicle',
    resourceId: '01J9G2H3J4K5L6M7N8P9Q0R1S3',
    createdAt: '2026-08-05T16:15:00.000Z',
  },
  {
    id: '01JNE9P0Q1R2S3T4U5V6W7X8Y9Z0',
    companyId: '01J8C2D3E4F5G6H7J8K9L0M1N2', // LogiSud
    userId: DEMO_USER_ID,
    kind: 'document_missing',
    title: 'Document manquant',
    message:
      'Le certificat d’assurance du Renault Master EF-2040-OP est manquant dans le dossier véhicule.',
    status: 'read',
    readAt: '2026-08-05T14:00:00.000Z',
    resourceType: 'vehicle',
    resourceId: '01J9C2D3E4F5G6H7J8K9L0M1N3',
    createdAt: '2026-08-05T13:20:00.000Z',
    metadata: { documentType: 'insurance_certificate' },
  },
  {
    id: '01JNA0Q1R2S3T4U5V6W7X8Y9Z0A1B2',
    companyId: '01J8H2J3K4L5M6N7P8Q9R0S1T2', // Sanaga Trans
    userId: DEMO_USER_ID,
    kind: 'plan_limit_soon',
    title: 'Limite du plan bientôt atteinte',
    message:
      'Sanaga Trans utilise 4 véhicules sur 5 autorisés par le plan Starter (80 %). Pensez à passer au plan supérieur.',
    status: 'read',
    readAt: '2026-08-05T10:00:00.000Z',
    resourceType: 'subscription',
    resourceId: '01JS8H9J0K1L2M3N4P5Q6R7S8T9',
    createdAt: '2026-08-05T09:30:00.000Z',
    metadata: { metric: 'vehicles', current: 4, limit: 5, usagePercent: 80 },
  },
  {
    id: '01JNA1B2C3D4E5F6G7H8J9K0L1M2',
    companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2', // Navix Trans
    userId: DEMO_USER_ID,
    kind: 'security_login',
    title: 'Connexion depuis un nouvel appareil',
    message:
      'Un accès au compte Navix Trans a été détecté depuis un nouvel appareil (Chrome — Douala). Si ce n’est pas vous, sécurisez immédiatement votre compte.',
    status: 'unread',
    resourceType: null,
    resourceId: null,
    createdAt: '2026-08-05T08:50:00.000Z',
    metadata: { device: 'Chrome — Windows', location: 'Douala, Cameroun' },
  },
  {
    id: '01JNA2C3D4E5F6G7H8J9K0L1M2N3',
    companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2', // Navix Trans
    userId: DEMO_USER_ID,
    kind: 'maintenance_due_soon',
    title: 'Entretien prévu aujourd’hui',
    message:
      'La révision du Volvo FH UV-4467-EF est programmée aujourd’hui. Pensez à planifier le passage à l’atelier.',
    status: 'unread',
    resourceType: 'maintenance',
    resourceId: '01JBX8J9K0L1M2N3P4Q5R6S7T8U9',
    createdAt: '2026-08-05T08:15:00.000Z',
    metadata: { scheduledDate: '2026-08-05' },
  },
  {
    id: '01JNA3D4E5F6G7H8J9K0L1M2N3P4',
    companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2', // Navix Trans
    userId: DEMO_USER_ID,
    kind: 'document_expiring',
    title: 'Carte grise bientôt expirée',
    message:
      'La carte grise du Volvo FH UV-4467-EF expire le 8 août 2026 (dans 3 jours).',
    status: 'unread',
    resourceType: 'vehicle',
    resourceId: '01J9L2M3N4P5Q6R7S8T9U0V1W3',
    createdAt: '2026-08-05T07:42:00.000Z',
    metadata: { expiresAt: '2026-08-08' },
  },
  {
    id: '01JNA4E5F6G7H8J9K0L1M2N3P4Q5',
    companyId: '01J8G2H3J4K5L6M7N8P9Q0R1S2', // Littoral Transport
    userId: DEMO_USER_ID,
    kind: 'vehicle_immobilized',
    title: 'Véhicule immobilisé',
    message:
      'Le Peugeot 3008 MN-5602-WX est hors service. Il ne peut être affecté tant que la remise en état n’est pas effectuée.',
    status: 'unread',
    resourceType: 'vehicle',
    resourceId: '01J9G2H3J4K5L6M7N8P9Q0R1S3',
    createdAt: '2026-08-05T06:20:00.000Z',
  },
  {
    id: '01JNA5F6G7H8J9K0L1M2N3P4Q5R6',
    companyId: '01J8E2F3G4H5J6K7L8M9N0P1Q2', // Nord Express
    userId: DEMO_USER_ID,
    kind: 'invoice_overdue',
    title: 'Facture en retard de paiement',
    message:
      'La facture NAVIX-2026-000007 (22 420 FCFA) de Nord Express est en retard depuis le 10 juillet 2026.',
    status: 'unread',
    resourceType: 'invoice',
    resourceId: '01KB0G7H8J9K0L1M2N3P4Q5R6S7',
    createdAt: '2026-08-05T05:45:00.000Z',
    metadata: { amount: 22420, currency: 'XAF', dueDate: '2026-07-10' },
  },
  {
    id: '01JNA6G7H8J9K0L1M2N3P4Q5R6S7',
    companyId: '01J8E2F3G4H5J6K7L8M9N0P1Q2', // Nord Express
    userId: DEMO_USER_ID,
    kind: 'plan_limit_reached',
    title: 'Limite du plan Starter atteinte',
    message:
      'Nord Express utilise 5 véhicules sur 5 autorisés par le plan Starter (100 %). Le dépassement entraînera des frais supplémentaires.',
    status: 'unread',
    resourceType: 'subscription',
    resourceId: '01JS5E6F7G8H9J0K1L2M3N4P5Q6',
    createdAt: '2026-08-04T17:30:00.000Z',
    metadata: { metric: 'vehicles', current: 5, limit: 5, usagePercent: 100 },
  },
  {
    id: '01JNA7H8J9K0L1M2N3P4Q5R6S7T8',
    companyId: '01J8K2L3M4N5P6Q7R8S9T0U1V2', // Sahel Express
    userId: DEMO_USER_ID,
    kind: 'maintenance_due_soon',
    title: 'Entretien planifié',
    message:
      'La révision du Land Cruiser 79 ST-9901-CD est planifiée au 12 août 2026.',
    status: 'unread',
    resourceType: 'maintenance',
    resourceId: '01JBXD3P4Q5R6S7T8U9V0W1X2Y3Z4',
    createdAt: '2026-08-04T15:10:00.000Z',
    metadata: { scheduledDate: '2026-08-12' },
  },
  {
    id: '01JNA8J9K0L1M2N3P4Q5R6S7T8U9',
    companyId: '01J8B2C3D4E5F6G7H8J9K0L1M2', // Cameroon Express
    userId: DEMO_USER_ID,
    kind: 'maintenance_overdue',
    title: 'Entretien en retard',
    message:
      'L’entretien de la Toyota Hiace WX-2210-GH était programmé le 15 juillet 2026 et n’a pas été effectué.',
    status: 'unread',
    resourceType: 'maintenance',
    resourceId: '01JBXA0L1M2N3P4Q5R6S7T8U9V0W1',
    createdAt: '2026-08-04T09:55:00.000Z',
    metadata: { scheduledDate: '2026-07-15' },
  },
  {
    id: '01JNA9K0L1M2N3P4Q5R6S7T8U9V0',
    companyId: '01J8H2J3K4L5M6N7P8Q9R0S1T2', // Sanaga Trans
    userId: DEMO_USER_ID,
    kind: 'subscription_expiring',
    title: 'Fin d’essai de l’abonnement',
    message:
      'L’essai gratuit du plan Starter de Sanaga Trans se termine le 10 août 2026. Choisissez une formule pour éviter une interruption.',
    status: 'unread',
    resourceType: 'subscription',
    resourceId: '01JS8H9J0K1L2M3N4P5Q6R7S8T9',
    createdAt: '2026-08-04T08:30:00.000Z',
    metadata: { endsAt: '2026-08-10' },
  },
  {
    id: '01JNB0L1M2N3P4Q5R6S7T8U9V0W1',
    companyId: '01J8D2E3F4G5H6J7K8L9M0N1P2', // Kribi Port Trans
    userId: DEMO_USER_ID,
    kind: 'assignment_created',
    title: 'Nouvelle affectation',
    message:
      'Awa Diop a été affectée à la Toyota Corolla GH 7781 QR pour une mission active.',
    status: 'unread',
    resourceType: 'assignment',
    resourceId: '01JAAD2E3F4G5H6J7K8L9M0N1P4',
    createdAt: '2026-08-03T18:45:00.000Z',
  },
  {
    id: '01JNB1M2N3P4Q5R6S7T8U9V0W1X2',
    companyId: '01J8J2K3L4M5N6P7Q8R9S0T1U2', // Douala Cars
    userId: DEMO_USER_ID,
    kind: 'invoice_issued',
    title: 'Nouvelle facture émise',
    message:
      'La facture NAVIX-2026-000012 (61 124 FCFA) a été émise pour Douala Cars. Paiement en attente de validation (carte bancaire).',
    status: 'unread',
    resourceType: 'invoice',
    resourceId: '01KB0M2N3P4Q5R6S7T8U9V1W2X3',
    createdAt: '2026-08-03T09:30:00.000Z',
    metadata: { amount: 61124, currency: 'XAF' },
  },
  {
    id: '01JNB2N3P4Q5R6S7T8U9V0W1X2Y3',
    companyId: '01J8K2L3M4N5P6Q7R8S9T0U1V2', // Sahel Express
    userId: DEMO_USER_ID,
    kind: 'vehicle_in_maintenance',
    title: 'Véhicule en entretien',
    message:
      'Le Land Cruiser 79 ST-9901-CD est en atelier. Il sera indisponible jusqu’à la fin de la révision.',
    status: 'read',
    readAt: '2026-08-03T16:20:00.000Z',
    resourceType: 'vehicle',
    resourceId: '01J9K2L3M4N5P6Q7R8S9T0U1V3',
    createdAt: '2026-08-03T08:00:00.000Z',
  },
  {
    id: '01JNB3P4Q5R6S7T8U9V0W1X2Y3Z4',
    companyId: '01J8F2G3H4J5K6L7M8N9P0Q1R2', // Ouest Logistique
    userId: DEMO_USER_ID,
    kind: 'license_expiring',
    title: 'Permis de conduire bientôt expiré',
    message:
      'Le permis de conduire de Rasmata Ouédraogo expire le 20 août 2026. Anticipez son renouvellement.',
    status: 'unread',
    resourceType: 'driver',
    resourceId: '01J9S2T3U4V5W6X7Y8Z9A0B1C2D3',
    createdAt: '2026-08-02T14:05:00.000Z',
    metadata: { expiresAt: '2026-08-20' },
  },
  {
    id: '01JNB4Q5R6S7T8U9V0W1X2Y3Z4A5',
    companyId: '01J8B2C3D4E5F6G7H8J9K0L1M2', // Cameroon Express
    userId: DEMO_USER_ID,
    kind: 'inspection_expiring',
    title: 'Visite technique bientôt expirée',
    message:
      'La visite technique du Mercedes Sprinter CD-5510-MN expire le 2 septembre 2026.',
    status: 'unread',
    resourceType: 'vehicle',
    resourceId: '01J9B2C3D4E5F6G7H8J9K0L1M3',
    createdAt: '2026-08-02T10:20:00.000Z',
    metadata: { expiresAt: '2026-09-02' },
  },
  {
    id: '01JNB5R6S7T8U9V0W1X2Y3Z4A5B6',
    companyId: '01J8E2F3G4H5J6K7L8M9N0P1Q2', // Nord Express
    userId: DEMO_USER_ID,
    kind: 'abnormal_consumption',
    title: 'Consommation anormale détectée',
    message:
      'La consommation du Hino 500 IJ-9034-ST dépasse de 24 % la moyenne du parc. Vérifiez la pression des pneus et l’état du véhicule.',
    status: 'unread',
    resourceType: 'vehicle',
    resourceId: '01J9E2F3G4H5J6K7L8M9N0P1Q3',
    createdAt: '2026-08-01T19:10:00.000Z',
    metadata: { deviationPercent: 24 },
  },
  {
    id: '01JNB6S7T8U9V0W1X2Y3Z4A5B6C7',
    companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2', // Navix Trans
    userId: DEMO_USER_ID,
    kind: 'report_generated',
    title: 'Rapport mensuel disponible',
    message:
      'Le rapport d’activité de juillet 2026 pour Navix Trans est disponible au téléchargement.',
    status: 'read',
    readAt: '2026-08-01T14:30:00.000Z',
    resourceType: 'report',
    resourceId: null,
    createdAt: '2026-08-01T09:00:00.000Z',
  },
  {
    id: '01JNB7T8U9V0W1X2Y3Z4A5B6C7D8',
    companyId: '01J8C2D3E4F5G6H7J8K9L0M1N2', // LogiSud
    userId: DEMO_USER_ID,
    kind: 'maintenance_in_progress',
    title: 'Entretien en cours',
    message:
      'L’entretien du Renault Master EF-2040-OP est en cours chez l’atelier partenaire (révision 30 000 km).',
    status: 'read',
    readAt: '2026-08-01T08:00:00.000Z',
    resourceType: 'maintenance',
    resourceId: '01JBX2C3D4E5F6G7H8J9K0L1M2N3',
    createdAt: '2026-07-31T17:20:00.000Z',
  },
  {
    id: '01JNB8U9V0W1X2Y3Z4A5B6C7D8E9',
    companyId: '01J8E2F3G4H5J6K7L8M9N0P1Q2', // Nord Express
    userId: DEMO_USER_ID,
    kind: 'payment_failed',
    title: 'Paiement échoué',
    message:
      'Le paiement Mobile Money de 22 420 FCFA a été refusé pour Nord Express. Vérifiez le compte ou choisissez un autre moyen de paiement.',
    status: 'read',
    readAt: '2026-08-01T09:30:00.000Z',
    resourceType: 'payment',
    resourceId: '01KM0E5F6G7H8J9K0L1M2N3P4Q5',
    createdAt: '2026-07-31T11:45:00.000Z',
  },
  {
    id: '01JNB9V0W1X2Y3Z4A5B6C7D8E9F0',
    companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2', // Navix Trans
    userId: DEMO_USER_ID,
    kind: 'subscription_renewed',
    title: 'Abonnement renouvelé',
    message:
      'L’abonnement Enterprise de Navix Trans a été renouvelé pour la période d’août 2026 (196 000 FCFA/mois).',
    status: 'read',
    readAt: '2026-07-29T16:00:00.000Z',
    resourceType: 'subscription',
    resourceId: '01JS1A2B3C4D5E6F7G8H9J0K1L2',
    createdAt: '2026-07-29T10:00:00.000Z',
  },
  {
    id: '01JNC0W1X2Y3Z4A5B6C7D8E9F0G1',
    companyId: '01J8D2E3F4G5H6J7K8L9M0N1P2', // Kribi Port Trans
    userId: DEMO_USER_ID,
    kind: 'payment_success',
    title: 'Paiement reçu',
    message:
      'Un virement de 611 240 FCFA a été reçu pour Kribi Port Trans (facture NAVIX-2026-000006).',
    status: 'read',
    readAt: '2026-07-28T12:00:00.000Z',
    resourceType: 'payment',
    resourceId: '01KM0D4E5F6G7H8J9K0L1M2N3P4',
    createdAt: '2026-07-28T10:00:00.000Z',
    metadata: { amount: 611240, currency: 'XAF' },
  },
  {
    id: '01JNC1X2Y3Z4A5B6C7D8E9F0G1H2',
    companyId: '01J8D2E3F4G5H6J7K8L9M0N1P2', // Kribi Port Trans
    userId: DEMO_USER_ID,
    kind: 'trip_completed',
    title: 'Trajet terminé',
    message:
      'Le trajet Douala → Yaoundé de la Toyota Corolla GH 7781 QR s’est terminé avec succès (250 km).',
    status: 'read',
    readAt: '2026-07-28T18:10:00.000Z',
    resourceType: 'trip',
    resourceId: '01JBC3D4E5F6G7H8J9K0L1M2N3P4',
    createdAt: '2026-07-28T15:30:00.000Z',
  },
  {
    id: '01JNC2Y3Z4A5B6C7D8E9F0G1H2J3',
    companyId: '01J8J2K3L4M5N6P7Q8R9S0T1U2', // Douala Cars
    userId: DEMO_USER_ID,
    kind: 'assignment_created',
    title: 'Nouvelle affectation',
    message:
      'Jean-Marc Ekani a été affecté au BYD K6 QR-3345-AB pour une mission planifiée.',
    status: 'read',
    readAt: '2026-07-26T18:00:00.000Z',
    resourceType: 'assignment',
    resourceId: '01JAAS2T3U4V5W6X7Y8Z9A0B1C9H',
    createdAt: '2026-07-26T09:15:00.000Z',
  },
  {
    id: '01JNC3Z4A5B6C7D8E9F0G1H2J3K4',
    companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2', // Navix Trans
    userId: DEMO_USER_ID,
    kind: 'user_created',
    title: 'Nouvel utilisateur ajouté',
    message:
      'Awa Kouamé a invité Chloé N’Guessan à rejoindre Navix Trans avec le rôle Gestionnaire de flotte.',
    status: 'read',
    readAt: '2026-07-22T17:00:00.000Z',
    resourceType: null,
    resourceId: null,
    createdAt: '2026-07-22T14:40:00.000Z',
  },
  {
    id: '01JNC4A5B6C7D8E9F0G1H2J3K4L5',
    companyId: '01J8K2L3M4N5P6Q7R8S9T0U1V2', // Sahel Express
    userId: DEMO_USER_ID,
    kind: 'insurance_expiring',
    title: 'Assurance bientôt expirée',
    message:
      'L’attestation d’assurance du Land Cruiser 79 ST-9901-CD expire le 14 novembre 2026.',
    status: 'read',
    readAt: '2026-07-21T16:30:00.000Z',
    resourceType: 'vehicle',
    resourceId: '01J9K2L3M4N5P6Q7R8S9T0U1V3',
    createdAt: '2026-07-21T08:00:00.000Z',
    metadata: { expiresAt: '2026-11-14' },
  },
  {
    id: '01JNC5B6C7D8E9F0G1H2J3K4L5M6',
    companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2', // Navix Trans
    userId: DEMO_USER_ID,
    kind: 'assignment_completed',
    title: 'Affectation terminée',
    message:
      'L’affectation du Volvo FH UV-4467-EF à Adama Bamba a été clôturée avec succès.',
    status: 'read',
    readAt: '2026-07-20T18:00:00.000Z',
    resourceType: 'assignment',
    resourceId: '01JAAN2P3Q4R5S6T7U8V9W0X1Y5D',
    createdAt: '2026-07-20T16:00:00.000Z',
  },
  {
    id: '01JNC6C7D8E9F0G1H2J3K4L5M6N7',
    companyId: '01J8K2L3M4N5P6Q7R8S9T0U1V2', // Sahel Express
    userId: DEMO_USER_ID,
    kind: 'payment_success',
    title: 'Paiement reçu',
    message:
      'Un virement de 2 312 800 FCFA a été reçu pour Sahel Express (facture NAVIX-2026-000013).',
    status: 'read',
    readAt: '2026-07-20T12:00:00.000Z',
    resourceType: 'payment',
    resourceId: '01KM0K0L1M2N3P4Q5R6S7T8U9V1',
    createdAt: '2026-07-20T09:00:00.000Z',
    metadata: { amount: 2312800, currency: 'XAF' },
  },
  {
    id: '01JNC7D8E9F0G1H2J3K4L5M6N7P8',
    companyId: '01J8H2J3K4L5M6N7P8Q9R0S1T2', // Sanaga Trans
    userId: DEMO_USER_ID,
    kind: 'company_created',
    title: 'Nouvelle entreprise enregistrée',
    message:
      'Sanaga Trans a rejoint la plateforme Navix Management. Compte créé avec un essai Starter de 14 jours.',
    status: 'read',
    readAt: '2026-06-25T17:00:00.000Z',
    resourceType: 'company',
    resourceId: '01J8H2J3K4L5M6N7P8Q9R0S1T2',
    createdAt: '2026-06-25T08:50:00.000Z',
  },
  {
    id: '01JNC8E9F0G1H2J3K4L5M6N7P8Q9R',
    companyId: '01J8B2C3D4E5F6G7H8J9K0L1M2', // Cameroon Express
    userId: DEMO_USER_ID,
    kind: 'invoice_overdue',
    title: 'Facture en retard',
    message:
      'La facture NAVIX-2026-000004 (61 124 FCFA) de Cameroon Express reste impayée depuis le 15 juin 2026.',
    status: 'archived',
    readAt: '2026-07-10T09:00:00.000Z',
    resourceType: 'invoice',
    resourceId: '01KB0D4E5F6G7H8J9K0L1M2N3P4',
    createdAt: '2026-06-16T08:00:00.000Z',
    metadata: { amount: 61124, currency: 'XAF' },
  },
  {
    id: '01JNC9F0G1H2J3K4L5M6N7P8Q9R0',
    companyId: '01J8C2D3E4F5G6H7J8K9L0M1N2', // LogiSud
    userId: DEMO_USER_ID,
    kind: 'license_expired',
    title: 'Permis de conduire expiré',
    message:
      'Le permis de conduire de Koffi N’Dri a expiré le 30 juillet 2026. La conduite n’est plus autorisée.',
    status: 'dismissed',
    readAt: '2026-08-01T08:00:00.000Z',
    resourceType: 'driver',
    resourceId: '01J9X2Y3Z4A5B6C7D8E9F0G1H2J3',
    createdAt: '2026-07-31T08:00:00.000Z',
  },
  {
    id: '01JND0G1H2J3K4L5M6N7P8Q9R0S1',
    companyId: '01J8C2D3E4F5G6H7J8K9L0M1N2', // LogiSud
    userId: DEMO_USER_ID,
    kind: 'vehicle_in_maintenance',
    title: 'Véhicule en atelier',
    message:
      'Le Renault Master EF-2040-OP est en atelier depuis le 28 juillet (révision 30 000 km).',
    status: 'dismissed',
    readAt: '2026-07-30T18:00:00.000Z',
    resourceType: 'vehicle',
    resourceId: '01J9C2D3E4F5G6H7J8K9L0M1N3',
    createdAt: '2026-07-30T10:10:00.000Z',
  },
  {
    id: '01JND1H2J3K4L5M6N7P8Q9R0S1T2',
    companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2', // Navix Trans
    userId: DEMO_USER_ID,
    kind: 'trip_cancelled',
    title: 'Trajet annulé',
    message:
      'Le trajet prévu pour la Toyota Hilux AB-3824-KL a été annulé (disponibilité du chauffeur).',
    status: 'read',
    readAt: '2026-07-18T18:00:00.000Z',
    resourceType: 'trip',
    resourceId: '01JBD1D2E3F4G5H6J7K8L9M0N1P2',
    createdAt: '2026-07-18T11:00:00.000Z',
  },
];

/** Notifications simulées, triées de la plus récente à la plus ancienne. */
export const MOCK_NOTIFICATIONS = RAW_NOTIFICATIONS.map(normalize).sort((a, b) =>
  b.createdAt.localeCompare(a.createdAt),
);

/** Carte id → notification (déjà normalisée). */
export const MOCK_NOTIFICATIONS_BY_ID = Object.fromEntries(
  MOCK_NOTIFICATIONS.map((notification) => [notification.id, notification]),
);
