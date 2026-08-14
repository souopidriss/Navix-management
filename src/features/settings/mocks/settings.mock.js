/**
 * Navix Settings — Données simulées du centre de configuration.
 *
 * Avertissement : ces paramètres sont générés localement pour la démo. La
 * persistance réelle (par entreprise / utilisateur) sera assurée par le futur
 * backend Express.js / MySQL. Rien ici n'est une source de vérité.
 *
 * Multi-tenant simulé : chaque jeu de paramètres est lié à un `companyId`
 * (entreprise) et, pour les préférences utilisateur, à un `userId`.
 * `buildDefaultSettings` personnalise les sections à partir du contexte
 * courant (entreprise et utilisateur connectés).
 */

export const DEFAULT_COMPANY_ID = 'cmp_demo';
export const DEFAULT_USER_ID = 'usr_001';

/** Base des paramètres (défauts de l'application). */
const DEFAULTS = {
  general: {
    appName: 'Navix Management',
    description: 'Plateforme SaaS de gestion de flotte de véhicules',
    logo: '',
    favicon: '',
    email: 'contact@navix.app',
    phone: '+237 07 00 00 00 00',
    website: 'https://navix.app',
    address: 'Bonapriso, Douala',
    country: 'CM',
    city: 'Douala',
    timezone: 'Africa/Douala',
    currency: 'XAF',
    language: 'fr',
  },
  company: {
    legalName: 'Navix Trans',
    tradingName: 'Navix',
    logo: '',
    email: 'contact@navixtrans.cm',
    phone: '+237 07 00 00 00 00',
    address: 'Zone industrielle, Bonabéri, Douala',
    country: 'CM',
    city: 'Douala',
    region: 'Littoral',
    taxNumber: 'TAX-2026-0451',
    tradeRegister: 'RC-DLA-2026-11874',
    website: 'https://navixtrans.cm',
    description: 'Société de transport de personnes et de marchandises',
  },
  fleet: {
    distanceUnit: 'km',
    consumptionUnit: 'l100km',
    fuelUnit: 'liter',
    mileageAlertThreshold: 5000,
    maintenanceAlertThreshold: 15,
    allowInactiveVehicles: true,
    enableMileageTracking: true,
    enableFuelTracking: true,
  },
  maintenance: {
    reminderEnabled: true,
    reminderDays: 7,
    mileageThreshold: 1000,
    automaticMaintenance: false,
    maintenanceAlert: true,
    overdueMaintenance: true,
    criticalMaintenance: true,
  },
  fuel: {
    currency: 'XAF',
    unit: 'liter',
    averagePrice: 825,
    abnormalConsumptionThreshold: 15,
    consumptionAlert: true,
    allowPriceEdit: true,
    allowManualEntry: true,
  },
  documents: {
    supportedTypes: ['pdf', 'png', 'jpg', 'jpeg'],
    expirationAlertDays: 30,
    allowUpload: true,
    allowDelete: false,
    maxFileSizeMb: 20,
    allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    defaultView: 'list',
    defaultSort: 'recent',
    itemsPerPage: 10,
    previewEnabled: true,
    autoPreviewImages: true,
    confirmBeforeDelete: true,
  },
  notifications: {
    enabled: true,
    inApp: true,
    email: true,
    push: true,
    sms: true,
    maintenance: true,
    fuel: true,
    documents: true,
    billing: true,
    subscription: true,
    audit: true,
    vehicles: true,
    trips: true,
    assignments: true,
    drivers: true,
    users: true,
    security: true,
    reports: true,
    critical: true,
  },
  user: {
    name: 'Awa Kouamé',
    email: 'demo@navix.app',
    phone: '+237 07 00 00 00 01',
    position: 'Administratrice de flotte',
    avatar: '',
    language: 'fr',
    timezone: 'Africa/Douala',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    currencyDisplay: 'symbol',
    landingPage: '/dashboard',
  },
  appearance: {
    theme: 'system',
    sidebarMode: 'expanded',
    animations: true,
    density: 'normal',
  },
  tables: {
    rowsPerPage: 10,
    density: 'normal',
    defaultSortBy: 'createdAt',
    defaultSortDirection: 'desc',
    stickyHeader: true,
    visibleColumns: ['identity', 'status', 'dates', 'amounts', 'actions'],
  },
  regional: {
    language: 'fr',
    country: 'CM',
    timezone: 'Africa/Douala',
    currency: 'XAF',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    firstDayOfWeek: 'monday',
    numberFormat: 'fr-FR',
    decimalSeparator: ',',
    thousandsSeparator: ' ',
  },
  billing: {
    companyName: 'Navix Trans',
    email: 'billing@navixtrans.cm',
    phone: '+237 07 00 00 00 02',
    address: 'Zone industrielle, Bonabéri, Douala',
    country: 'CM',
    city: 'Douala',
    taxId: 'TAX-2026-0451',
    currency: 'XAF',
    taxRate: 0.18,
    invoicePrefix: 'NAVIX',
    paymentTermsDays: 30,
    autoRemindersEnabled: true,
    autoRemindersDaysBeforeDue: 5,
  },
  saas: {
    plan: 'enterprise',
    planLabel: 'Enterprise',
    status: 'active',
    startDate: '2026-01-15',
    renewalDate: '2026-09-15',
    expirationDate: '2026-09-15',
    isTrial: false,
    trialEndsAt: null,
    usage: { vehicles: 18, drivers: 22, storageGb: 34.5, seats: 9 },
    limits: { vehicles: 50, drivers: 50, storageGb: 100, seats: 10 },
  },
  security: {
    lastLogin: '2026-08-07T08:12:00.000Z',
    twoFactorEnabled: false,
    sessionTimeoutMinutes: 60,
    passwordLastChanged: '2026-07-20T10:00:00.000Z',
    sessions: [
      {
        id: 'sess_8f1a',
        device: 'Chrome sur Windows 10',
        location: 'Douala, CM',
        ipAddress: '102.164.25.10',
        current: true,
        createdAt: '2026-08-07T08:12:00.000Z',
        lastActiveAt: '2026-08-07T09:00:00.000Z',
      },
      {
        id: 'sess_9c2b',
        device: 'Safari sur iPhone',
        location: 'Douala, CM',
        ipAddress: '41.139.98.11',
        current: false,
        createdAt: '2026-08-06T22:40:00.000Z',
        lastActiveAt: '2026-08-07T07:55:00.000Z',
      },
    ],
    trustedDevices: [
      {
        id: 'dev_01',
        label: 'Chrome — Windows 10',
        createdAt: '2026-05-14T09:30:00.000Z',
        lastSeenAt: '2026-08-07T09:00:00.000Z',
      },
      {
        id: 'dev_02',
        label: 'Safari — iPhone',
        createdAt: '2026-06-02T14:15:00.000Z',
        lastSeenAt: '2026-08-06T22:40:00.000Z',
      },
    ],
    loginHistory: [
      {
        id: 'log_01',
        at: '2026-08-07T08:12:00.000Z',
        ipAddress: '102.164.25.10',
        device: 'Chrome sur Windows 10',
        status: 'success',
      },
      {
        id: 'log_02',
        at: '2026-08-06T22:40:00.000Z',
        ipAddress: '41.139.98.11',
        device: 'Safari sur iPhone',
        status: 'success',
      },
      {
        id: 'log_03',
        at: '2026-08-06T08:05:00.000Z',
        ipAddress: '102.164.25.10',
        device: 'Chrome sur Windows 10',
        status: 'warning',
      },
    ],
  },
  system: {
    appVersion: '0.1.0',
    environment: 'development',
    lastSyncAt: '2026-08-07T08:00:00.000Z',
    systemStatus: 'operational',
    maintenanceMode: false,
    systemNotifications: true,
  },
};

/** @returns {object} — copie profonde d'un objet (défauts sûrs). */
const clone = (value) => (Array.isArray(value) ? value.map(clone) : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).map(([k, v]) => [k, clone(v)])) : value);

/**
 * Construit le bundle de paramètres par défaut pour une portée donnée.
 * @param {object} [context] — { companyId, userId, companyName, userName, userEmail }
 * @returns {{ [section]: object, meta: object }}
 */
export const buildDefaultSettings = ({
  companyId = DEFAULT_COMPANY_ID,
  userId = DEFAULT_USER_ID,
  companyName = 'Navix Trans',
  userName = 'Awa Kouamé',
  userEmail = 'demo@navix.app',
} = {}) => {
  const settings = Object.fromEntries(
    Object.entries(DEFAULTS).map(([key, value]) => [key, clone(value)]),
  );

  if (companyName) {
    settings.general.appName = settings.general.appName ?? companyName;
    settings.company.legalName = companyName;
    settings.company.tradingName = companyName.split(' ')[0] ?? settings.company.tradingName;
    settings.billing.companyName = companyName;
  }
  if (userName) settings.user.name = userName;
  if (userEmail) settings.user.email = userEmail;

  return {
    ...settings,
    meta: {
      companyId,
      userId,
      updatedAt: settings.system.lastSyncAt,
    },
  };
};

/** Jeu de paramètres par défaut (portée démo). */
export const DEFAULT_SETTINGS = buildDefaultSettings();

/** Clés de sections de paramètres (ordre de référence). */
export const DEFAULT_SETTINGS_SECTION_KEYS = Object.keys(DEFAULTS);
