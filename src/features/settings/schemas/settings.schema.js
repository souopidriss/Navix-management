/**
 * Navix Settings — Schémas de validation Zod
 * --------------------------------------------------------------------------
 * Validation exclusive Zod pour les 14 sections de paramètres (formulaires
 * en noValidate). Chaque section expose :
 *   - <section>SettingsSchema      : schéma de validation
 *   - <section>SettingsDefaultValues : valeurs par défaut (formulaires)
 *   - to<Section>FormValues(data)  : modèle métier → formulaire
 *   - to<Section>Payload(values)   : formulaire → payload métier
 * Les champs numériques utilisent `z.coerce.number()` (saisies `<input>`).
 */
import { z } from 'zod';
import {
  CURRENCY_VALUES,
  DISTANCE_UNITS,
  CONSUMPTION_UNITS,
  FUEL_UNITS,
  TAX_RATE_VALUES,
  DATE_FORMATS,
  TIME_FORMATS,
  FIRST_DAYS_OF_WEEK,
  NUMBER_LOCALES,
  DECIMAL_SEPARATORS,
  THOUSAND_SEPARATORS,
  EXPIRATION_ALERT_DAYS,
  DOCUMENT_MIME_TYPES,
  UI_DENSITIES,
  SIDEBAR_MODES,
  LANGUAGES,
  TIMEZONES,
} from '../constants';
import { THEME_MODES } from '@/config';

const text = (message = 'Champ requis.') => z.string().trim().min(1, message);
const email = (message = 'Adresse e-mail invalide.') => z.string().trim().email(message).or(z.literal(''));
const url = (message = 'URL invalide.') => z.string().trim().url(message).or(z.literal(''));
const nonNegative = (message = 'Valeur invalide.') => z.coerce.number().min(0, message);
const positive = (message = 'Valeur invalide.') => z.coerce.number().positive(message);

const langValues = LANGUAGES.map((option) => option.value);
const timezoneValues = TIMEZONES.map((option) => option.value);
const dateFormatValues = DATE_FORMATS.map((option) => option.value);
const timeFormatValues = TIME_FORMATS.map((option) => option.value);
const distanceUnitValues = DISTANCE_UNITS.map((option) => option.value);
const consumptionUnitValues = CONSUMPTION_UNITS.map((option) => option.value);
const fuelUnitValues = FUEL_UNITS.map((option) => option.value);
const firstDayValues = FIRST_DAYS_OF_WEEK.map((option) => option.value);
const numberLocaleValues = NUMBER_LOCALES.map((option) => option.value);
const decimalSeparatorValues = DECIMAL_SEPARATORS.map((option) => option.value);
const thousandSeparatorValues = THOUSAND_SEPARATORS.map((option) => option.value);
const densityValues = UI_DENSITIES.map((option) => option.value);
const sidebarModeValues = SIDEBAR_MODES.map((option) => option.value);
const themeModeValues = Object.values(THEME_MODES);

const enumOf = (values, message = 'Valeur invalide.') =>
  z.enum(values, { errorMap: () => ({ message }) });

/* --------------------------------------------------------------------------
   Général
   -------------------------------------------------------------------------- */

export const generalSettingsSchema = z.object({
  appName: text('Le nom de l’application est requis.').min(2, 'Nom trop court.'),
  description: z.string().trim().max(300, 'Description trop longue (300 caractères max).'),
  logo: url(),
  favicon: url(),
  email,
  phone: z.string().trim(),
  website: url(),
  address: z.string().trim(),
  country: text(),
  city: text(),
  timezone: enumOf(timezoneValues, 'Fuseau horaire invalide.'),
  currency: enumOf(CURRENCY_VALUES, 'Devise invalide.'),
  language: enumOf(langValues, 'Langue invalide.'),
});

export const generalSettingsDefaultValues = {
  appName: '',
  description: '',
  logo: '',
  favicon: '',
  email: '',
  phone: '',
  website: '',
  address: '',
  country: '',
  city: '',
  timezone: 'Africa/Abidjan',
  currency: 'XAF',
  language: 'fr',
};

export const toGeneralFormValues = (data = {}) => ({ ...generalSettingsDefaultValues, ...data });
export const toGeneralPayload = (values) => ({ ...values });

/* --------------------------------------------------------------------------
   Entreprise
   -------------------------------------------------------------------------- */

export const companySettingsSchema = z.object({
  legalName: text('Le nom légal est requis.').min(2, 'Nom trop court.'),
  tradingName: text('Le nom commercial est requis.'),
  logo: url(),
  email,
  phone: z.string().trim(),
  address: z.string().trim(),
  country: text(),
  city: text(),
  region: z.string().trim(),
  taxNumber: z.string().trim(),
  tradeRegister: z.string().trim(),
  website: url(),
  description: z.string().trim().max(500, 'Description trop longue (500 caractères max).'),
});

export const companySettingsDefaultValues = {
  legalName: '',
  tradingName: '',
  logo: '',
  email: '',
  phone: '',
  address: '',
  country: '',
  city: '',
  region: '',
  taxNumber: '',
  tradeRegister: '',
  website: '',
  description: '',
};

export const toCompanyFormValues = (data = {}) => ({ ...companySettingsDefaultValues, ...data });
export const toCompanyPayload = (values) => ({ ...values });

/* --------------------------------------------------------------------------
   Flotte
   -------------------------------------------------------------------------- */

export const fleetSettingsSchema = z.object({
  distanceUnit: enumOf(distanceUnitValues, 'Unité de distance invalide.'),
  consumptionUnit: enumOf(consumptionUnitValues, 'Unité de consommation invalide.'),
  fuelUnit: enumOf(fuelUnitValues, 'Unité de carburant invalide.'),
  mileageAlertThreshold: nonNegative('Seuil invalide.'),
  maintenanceAlertThreshold: nonNegative('Seuil invalide.'),
  allowInactiveVehicles: z.boolean(),
  enableMileageTracking: z.boolean(),
  enableFuelTracking: z.boolean(),
});

export const fleetSettingsDefaultValues = {
  distanceUnit: 'km',
  consumptionUnit: 'l100km',
  fuelUnit: 'liter',
  mileageAlertThreshold: 5000,
  maintenanceAlertThreshold: 15,
  allowInactiveVehicles: true,
  enableMileageTracking: true,
  enableFuelTracking: true,
};

export const toFleetFormValues = (data = {}) => ({ ...fleetSettingsDefaultValues, ...data });
export const toFleetPayload = (values) => ({ ...values });

/* --------------------------------------------------------------------------
   Maintenance
   -------------------------------------------------------------------------- */

export const maintenanceSettingsSchema = z.object({
  reminderEnabled: z.boolean(),
  reminderDays: nonNegative('Délai invalide.'),
  mileageThreshold: nonNegative('Seuil invalide.'),
  automaticMaintenance: z.boolean(),
  maintenanceAlert: z.boolean(),
  overdueMaintenance: z.boolean(),
  criticalMaintenance: z.boolean(),
});

export const maintenanceSettingsDefaultValues = {
  reminderEnabled: true,
  reminderDays: 7,
  mileageThreshold: 1000,
  automaticMaintenance: false,
  maintenanceAlert: true,
  overdueMaintenance: true,
  criticalMaintenance: true,
};

export const toMaintenanceFormValues = (data = {}) => ({ ...maintenanceSettingsDefaultValues, ...data });
export const toMaintenancePayload = (values) => ({ ...values });

/* --------------------------------------------------------------------------
   Carburant
   -------------------------------------------------------------------------- */

export const fuelSettingsSchema = z.object({
  currency: enumOf(CURRENCY_VALUES, 'Devise invalide.'),
  unit: enumOf(fuelUnitValues, 'Unité invalide.'),
  averagePrice: positive('Le prix moyen doit être positif.'),
  abnormalConsumptionThreshold: nonNegative('Seuil invalide.'),
  consumptionAlert: z.boolean(),
  allowPriceEdit: z.boolean(),
  allowManualEntry: z.boolean(),
});

export const fuelSettingsDefaultValues = {
  currency: 'XAF',
  unit: 'liter',
  averagePrice: 825,
  abnormalConsumptionThreshold: 15,
  consumptionAlert: true,
  allowPriceEdit: true,
  allowManualEntry: true,
};

export const toFuelFormValues = (data = {}) => ({ ...fuelSettingsDefaultValues, ...data });
export const toFuelPayload = (values) => ({ ...values });

/* --------------------------------------------------------------------------
   Documents
   -------------------------------------------------------------------------- */

export const documentSettingsSchema = z.object({
  supportedTypes: z.array(z.string()).min(1, 'Au moins un type de document est requis.'),
  expirationAlertDays: z.coerce
    .number()
    .refine((value) => EXPIRATION_ALERT_DAYS.includes(Number(value)), 'Délai d’alerte invalide.'),
  allowUpload: z.boolean(),
  allowDelete: z.boolean(),
  maxFileSizeMb: positive('Taille maximale invalide.'),
  allowedMimeTypes: z.array(z.string()).min(1, 'Au moins un type MIME est requis.'),
});

export const documentSettingsDefaultValues = {
  supportedTypes: ['pdf'],
  expirationAlertDays: 30,
  allowUpload: true,
  allowDelete: false,
  maxFileSizeMb: 20,
  allowedMimeTypes: ['application/pdf'],
};

export const toDocumentFormValues = (data = {}) => ({ ...documentSettingsDefaultValues, ...data });
export const toDocumentPayload = (values) => ({ ...values });

export { DOCUMENT_MIME_TYPES };

/* --------------------------------------------------------------------------
   Notifications
   -------------------------------------------------------------------------- */

export const notificationSettingsSchema = z.object({
  enabled: z.boolean(),
  email: z.boolean(),
  system: z.boolean(),
  maintenance: z.boolean(),
  fuel: z.boolean(),
  documents: z.boolean(),
  billing: z.boolean(),
  subscription: z.boolean(),
  audit: z.boolean(),
  critical: z.boolean(),
});

export const notificationSettingsDefaultValues = {
  enabled: true,
  email: true,
  system: true,
  maintenance: true,
  fuel: true,
  documents: true,
  billing: true,
  subscription: true,
  audit: true,
  critical: true,
};

export const toNotificationFormValues = (data = {}) => ({ ...notificationSettingsDefaultValues, ...data });
export const toNotificationPayload = (values) => ({ ...values });

/* --------------------------------------------------------------------------
   Utilisateur
   -------------------------------------------------------------------------- */

export const userSettingsSchema = z.object({
  name: text('Le nom est requis.').min(2, 'Nom trop court.'),
  email,
  phone: z.string().trim(),
  position: z.string().trim(),
  avatar: url(),
  language: enumOf(langValues, 'Langue invalide.'),
  timezone: enumOf(timezoneValues, 'Fuseau horaire invalide.'),
  dateFormat: enumOf(dateFormatValues, 'Format de date invalide.'),
  timeFormat: enumOf(timeFormatValues, 'Format d’heure invalide.'),
});

export const userSettingsDefaultValues = {
  name: '',
  email: '',
  phone: '',
  position: '',
  avatar: '',
  language: 'fr',
  timezone: 'Africa/Abidjan',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: 'HH:mm',
};

export const toUserFormValues = (data = {}) => ({ ...userSettingsDefaultValues, ...data });
export const toUserPayload = (values) => ({ ...values });

/* --------------------------------------------------------------------------
   Apparence
   -------------------------------------------------------------------------- */

export const appearanceSettingsSchema = z.object({
  theme: enumOf(themeModeValues, 'Mode invalide.'),
  sidebarMode: enumOf(sidebarModeValues, 'Mode de sidebar invalide.'),
  animations: z.boolean(),
  density: enumOf(densityValues, 'Densité invalide.'),
});

export const appearanceSettingsDefaultValues = {
  theme: 'system',
  sidebarMode: 'expanded',
  animations: true,
  density: 'normal',
};

export const toAppearanceFormValues = (data = {}) => ({ ...appearanceSettingsDefaultValues, ...data });
export const toAppearancePayload = (values) => ({ ...values });

/* --------------------------------------------------------------------------
   Régional
   -------------------------------------------------------------------------- */

export const regionalSettingsSchema = z.object({
  language: enumOf(langValues, 'Langue invalide.'),
  country: text(),
  timezone: enumOf(timezoneValues, 'Fuseau horaire invalide.'),
  currency: enumOf(CURRENCY_VALUES, 'Devise invalide.'),
  dateFormat: enumOf(dateFormatValues, 'Format de date invalide.'),
  timeFormat: enumOf(timeFormatValues, 'Format d’heure invalide.'),
  firstDayOfWeek: enumOf(firstDayValues, 'Premier jour de semaine invalide.'),
  numberFormat: enumOf(numberLocaleValues, 'Format numérique invalide.'),
  decimalSeparator: enumOf(decimalSeparatorValues, 'Séparateur décimal invalide.'),
  thousandsSeparator: enumOf(thousandSeparatorValues, 'Séparateur de milliers invalide.'),
});

export const regionalSettingsDefaultValues = {
  language: 'fr',
  country: 'CI',
  timezone: 'Africa/Abidjan',
  currency: 'XAF',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: 'HH:mm',
  firstDayOfWeek: 'monday',
  numberFormat: 'fr-FR',
  decimalSeparator: ',',
  thousandsSeparator: ' ',
};

export const toRegionalFormValues = (data = {}) => ({ ...regionalSettingsDefaultValues, ...data });
export const toRegionalPayload = (values) => ({ ...values });

/* --------------------------------------------------------------------------
   Facturation (configuration uniquement — la logique reste dans Billing)
   -------------------------------------------------------------------------- */

export const billingSettingsSchema = z.object({
  companyName: text('La raison sociale est requise.'),
  email,
  phone: z.string().trim(),
  address: z.string().trim(),
  country: text(),
  city: text(),
  taxId: z.string().trim(),
  currency: enumOf(CURRENCY_VALUES, 'Devise invalide.'),
  taxRate: z.coerce.number().refine((value) => TAX_RATE_VALUES.includes(Number(value)), 'Taux de taxe invalide.'),
  invoicePrefix: text('Le préfixe de facture est requis.').min(2, 'Préfixe trop court.'),
  paymentTermsDays: z.coerce.number().int().min(1, 'Le délai doit être d’au moins 1 jour.'),
  autoRemindersEnabled: z.boolean(),
  autoRemindersDaysBeforeDue: z.coerce.number().int().min(0, 'Délai invalide.'),
});

export const billingSettingsDefaultValues = {
  companyName: '',
  email: '',
  phone: '',
  address: '',
  country: '',
  city: '',
  taxId: '',
  currency: 'XAF',
  taxRate: 0.18,
  invoicePrefix: 'NAVIX',
  paymentTermsDays: 30,
  autoRemindersEnabled: true,
  autoRemindersDaysBeforeDue: 5,
};

export const toBillingFormValues = (data = {}) => ({ ...billingSettingsDefaultValues, ...data });
export const toBillingPayload = (values) => ({ ...values });

/* --------------------------------------------------------------------------
   SaaS
   -------------------------------------------------------------------------- */

export const saasSettingsSchema = z.object({
  plan: text(),
  planLabel: text(),
  status: text(),
  startDate: text(),
  renewalDate: text(),
  expirationDate: text(),
  isTrial: z.boolean(),
  trialEndsAt: z.string().nullable(),
  usage: z.object({
    vehicles: nonNegative(),
    drivers: nonNegative(),
    storageGb: nonNegative(),
    seats: nonNegative(),
  }),
  limits: z.object({
    vehicles: positive(),
    drivers: positive(),
    storageGb: positive(),
    seats: positive(),
  }),
});

export const saasSettingsDefaultValues = {
  plan: '',
  planLabel: '',
  status: '',
  startDate: '',
  renewalDate: '',
  expirationDate: '',
  isTrial: false,
  trialEndsAt: null,
  usage: { vehicles: 0, drivers: 0, storageGb: 0, seats: 0 },
  limits: { vehicles: 0, drivers: 0, storageGb: 0, seats: 0 },
};

export const toSaasFormValues = (data = {}) => ({ ...saasSettingsDefaultValues, ...data });
export const toSaasPayload = (values) => ({ ...values });

/* --------------------------------------------------------------------------
   Sécurité
   -------------------------------------------------------------------------- */

export const securitySettingsSchema = z.object({
  lastLogin: z.string().nullable(),
  twoFactorEnabled: z.boolean(),
  sessionTimeoutMinutes: z.coerce.number().int().min(5, 'Minimum 5 minutes.'),
  passwordLastChanged: z.string().nullable(),
  sessions: z.array(
    z.object({
      id: z.string(),
      device: z.string(),
      location: z.string(),
      ipAddress: z.string(),
      current: z.boolean(),
      createdAt: z.string(),
      lastActiveAt: z.string(),
    }),
  ),
  trustedDevices: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      createdAt: z.string(),
      lastSeenAt: z.string(),
    }),
  ),
  loginHistory: z.array(
    z.object({
      id: z.string(),
      at: z.string(),
      ipAddress: z.string(),
      device: z.string(),
      status: z.string(),
    }),
  ),
});

export const securitySettingsDefaultValues = {
  lastLogin: null,
  twoFactorEnabled: false,
  sessionTimeoutMinutes: 60,
  passwordLastChanged: null,
  sessions: [],
  trustedDevices: [],
  loginHistory: [],
};

export const toSecurityFormValues = (data = {}) => ({ ...securitySettingsDefaultValues, ...data });
export const toSecurityPayload = (values) => ({ ...values });

/* --------------------------------------------------------------------------
   Système
   -------------------------------------------------------------------------- */

export const systemSettingsSchema = z.object({
  appVersion: text(),
  environment: text(),
  lastSyncAt: text(),
  systemStatus: text(),
  maintenanceMode: z.boolean(),
  systemNotifications: z.boolean(),
});

export const systemSettingsDefaultValues = {
  appVersion: '0.1.0',
  environment: 'development',
  lastSyncAt: '',
  systemStatus: 'operational',
  maintenanceMode: false,
  systemNotifications: true,
};

export const toSystemFormValues = (data = {}) => ({ ...systemSettingsDefaultValues, ...data });
export const toSystemPayload = (values) => ({ ...values });

/* --------------------------------------------------------------------------
   Registre des schémas par section (pour les pages et le store)
   -------------------------------------------------------------------------- */

export const SETTINGS_SCHEMAS = {
  general: generalSettingsSchema,
  company: companySettingsSchema,
  fleet: fleetSettingsSchema,
  maintenance: maintenanceSettingsSchema,
  fuel: fuelSettingsSchema,
  documents: documentSettingsSchema,
  notifications: notificationSettingsSchema,
  user: userSettingsSchema,
  appearance: appearanceSettingsSchema,
  regional: regionalSettingsSchema,
  billing: billingSettingsSchema,
  saas: saasSettingsSchema,
  security: securitySettingsSchema,
  system: systemSettingsSchema,
};

export const SETTINGS_DEFAULT_VALUES = {
  general: generalSettingsDefaultValues,
  company: companySettingsDefaultValues,
  fleet: fleetSettingsDefaultValues,
  maintenance: maintenanceSettingsDefaultValues,
  fuel: fuelSettingsDefaultValues,
  documents: documentSettingsDefaultValues,
  notifications: notificationSettingsDefaultValues,
  user: userSettingsDefaultValues,
  appearance: appearanceSettingsDefaultValues,
  regional: regionalSettingsDefaultValues,
  billing: billingSettingsDefaultValues,
  saas: saasSettingsDefaultValues,
  security: securitySettingsDefaultValues,
  system: systemSettingsDefaultValues,
};

/** @returns {object} — valeurs de formulaire d'une section. */
export const getSettingsFormValues = (sectionKey, data = {}) => ({
  ...(SETTINGS_DEFAULT_VALUES[sectionKey] ?? {}),
  ...data,
});

/** @returns {object} — payload métier d'une section. */
export const getSettingsPayload = (values) => ({ ...values });
