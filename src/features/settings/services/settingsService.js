/**
 * Navix Settings — SettingsService
 * --------------------------------------------------------------------------
 * Responsabilité : fournir les paramètres de configuration aux vues et aux
 * stores. Mode mock : données simulées en mémoire, aucune requête HTTP réelle
 * (le contrat d'interface Axios + API_ENDPOINTS.SETTINGS est préparé pour le
 * futur backend Express.js).
 *
 * Multi-tenant simulé : les paramètres sont chargés / mis à jour dans une
 * portée `companyId` (entreprise) et `userId` (préférences utilisateur).
 * Ne jamais mélanger les configurations entre entreprises.
 *
 * Méthodes :
 *   getSettings(ctx) / updateSettings(section, values, ctx)
 *   get<Section>Settings(ctx) / update<Section>Settings(values, ctx)
 *   getSectionSettings(section, ctx) / updateSectionSettings(section, values, ctx)
 *   resetSectionSettings(section, ctx) / resetAllSettings(ctx)
 */
import { buildDefaultSettings, DEFAULT_COMPANY_ID, DEFAULT_USER_ID } from '../mocks';
import { ApiError } from '@/services/errors';
import { SETTINGS_SCHEMAS, SETTINGS_DEFAULT_VALUES } from '../schemas';
import { getSettingsSection, SENSITIVE_SETTINGS_SECTIONS, USER_SCOPE_SECTIONS } from '../constants';
import { emitSettingsNotification, emitSettingsAuditLog } from './settingsIntegrationService';

/** Cache mémoire par portée (entreprise + utilisateur). */
let settingsByScope = {};

const clone = (value) =>
  Array.isArray(value)
    ? value.map(clone)
    : value && typeof value === 'object'
      ? Object.fromEntries(Object.entries(value).map(([key, item]) => [key, clone(item)]))
      : value;

const scopeKey = ({ companyScopeId, userId }) =>
  `${companyScopeId || DEFAULT_COMPANY_ID}::${userId || DEFAULT_USER_ID}`;

const getBundle = ({ companyScopeId, userId }) => {
  const key = scopeKey({ companyScopeId, userId });
  if (!settingsByScope[key]) {
    settingsByScope[key] = buildDefaultSettings({
      companyId: companyScopeId || DEFAULT_COMPANY_ID,
      userId: userId || DEFAULT_USER_ID,
    });
  }
  return settingsByScope[key];
};

const requireSection = (sectionKey) => {
  if (!SETTINGS_SCHEMAS[sectionKey]) {
    throw ApiError.notFound(`Section de paramètres inconnue : ${sectionKey}`);
  }
  return sectionKey;
};

const validate = (sectionKey, values) => {
  const schema = SETTINGS_SCHEMAS[sectionKey];
  const result = schema.safeParse(values);
  if (!result.success) {
    const message = result.error.issues[0]?.message ?? 'Paramètres invalides.';
    throw ApiError.badRequest(message, result.error.flatten());
  }
  return result.data;
};

const applyScopeDefaults = (bundle, { companyScopeId, userId }) => {
  const base = buildDefaultSettings({
    companyId: companyScopeId || DEFAULT_COMPANY_ID,
    userId: userId || DEFAULT_USER_ID,
  });
  Object.keys(SETTINGS_SCHEMAS).forEach((key) => {
    if (!bundle[key]) bundle[key] = base[key];
  });
  if (!bundle.meta) bundle.meta = { companyId: base.meta.companyId, userId: base.meta.userId };
  return bundle;
};

/* --------------------------------------------------------------------------
   Lecture
   -------------------------------------------------------------------------- */

export const getSectionSettings = (sectionKey, ctx = {}) => {
  const key = requireSection(sectionKey);
  const bundle = applyScopeDefaults(getBundle(ctx), ctx);
  return clone(bundle[key]);
};

export const getSettings = (ctx = {}) => {
  const bundle = applyScopeDefaults(getBundle(ctx), ctx);
  const sections = {};
  Object.keys(SETTINGS_SCHEMAS).forEach((key) => {
    sections[key] = clone(bundle[key]);
  });
  return { ...sections, meta: { ...bundle.meta } };
};

/* --------------------------------------------------------------------------
   Mise à jour
   -------------------------------------------------------------------------- */

const notifyUpdate = (sectionKey, previous, next) => {
  const section = getSettingsSection(sectionKey);
  const isSensitive = SENSITIVE_SETTINGS_SECTIONS.includes(sectionKey);

  emitSettingsNotification({
    section: sectionKey,
    title: 'Paramètres modifiés',
    message: `La section « ${section.label} » a été mise à jour.`,
  });

  if (isSensitive) {
    emitSettingsAuditLog({
      section: sectionKey,
      sectionLabel: section.label,
      description: `Modification des paramètres : ${section.label}`,
      action: 'UPDATE',
      severity: sectionKey === 'security' ? 'high' : 'medium',
      oldValues: previous,
      newValues: next,
    });
  }
};

export const updateSectionSettings = (sectionKey, values, ctx = {}) => {
  const key = requireSection(sectionKey);
  const validated = validate(key, values);
  const bundle = applyScopeDefaults(getBundle(ctx), ctx);

  const previous = clone(bundle[key]);
  bundle[key] = { ...previous, ...validated };
  bundle.meta = { ...bundle.meta, updatedAt: new Date().toISOString() };

  notifyUpdate(key, previous, bundle[key]);
  return clone(bundle[key]);
};

export const updateSettings = (sectionKey, values, ctx = {}) =>
  updateSectionSettings(sectionKey, values, ctx);

/* --------------------------------------------------------------------------
   Réinitialisation
   -------------------------------------------------------------------------- */

export const resetSectionSettings = (sectionKey, ctx = {}) => {
  const key = requireSection(sectionKey);
  const bundle = applyScopeDefaults(getBundle(ctx), ctx);
  const defaults = buildDefaultSettings({
    companyId: ctx.companyScopeId || DEFAULT_COMPANY_ID,
    userId: ctx.userId || DEFAULT_USER_ID,
  });
  bundle[key] = clone(SETTINGS_DEFAULT_VALUES[key] ?? defaults[key]);
  bundle.meta = { ...bundle.meta, updatedAt: new Date().toISOString() };
  return clone(bundle[key]);
};

export const resetAllSettings = (ctx = {}) => {
  const key = scopeKey(ctx);
  settingsByScope[key] = buildDefaultSettings({
    companyId: ctx.companyScopeId || DEFAULT_COMPANY_ID,
    userId: ctx.userId || DEFAULT_USER_ID,
  });
  return getSettings(ctx);
};

/**
 * Réinitialise UNIQUEMENT les préférences utilisateur (user, apparence,
 * régional, tableaux, notifications). Les paramètres d'entreprise et de la
 * plateforme (general, company, fleet, maintenance, fuel, documents, billing,
 * saas, security, system) sont conservés.
 * @returns {object} — bundle complet mis à jour (sections utilisateur par défaut).
 */
export const resetUserPreferences = (ctx = {}) => {
  const bundle = applyScopeDefaults(getBundle(ctx), ctx);
  const defaults = buildDefaultSettings({
    companyId: ctx.companyScopeId || DEFAULT_COMPANY_ID,
    userId: ctx.userId || DEFAULT_USER_ID,
  });
  USER_SCOPE_SECTIONS.forEach((key) => {
    bundle[key] = clone(SETTINGS_DEFAULT_VALUES[key] ?? defaults[key]);
  });
  bundle.meta = { ...bundle.meta, updatedAt: new Date().toISOString() };
  return getSettings(ctx);
};

/* --------------------------------------------------------------------------
   Facades nommées (contrat du sprint)
   -------------------------------------------------------------------------- */

const SECTION_GETTERS = {
  general: 'getGeneralSettings',
  company: 'getCompanySettings',
  fleet: 'getFleetSettings',
  maintenance: 'getMaintenanceSettings',
  fuel: 'getFuelSettings',
  documents: 'getDocumentSettings',
  notifications: 'getNotificationSettings',
  user: 'getUserSettings',
  appearance: 'getAppearanceSettings',
  tables: 'getTablesSettings',
  regional: 'getRegionalSettings',
  billing: 'getBillingSettings',
  saas: 'getSaasSettings',
  security: 'getSecuritySettings',
  system: 'getSystemSettings',
};

const SECTION_UPDATERS = {
  general: 'updateGeneralSettings',
  company: 'updateCompanySettings',
  fleet: 'updateFleetSettings',
  maintenance: 'updateMaintenanceSettings',
  fuel: 'updateFuelSettings',
  documents: 'updateDocumentSettings',
  notifications: 'updateNotificationSettings',
  user: 'updateUserSettings',
  appearance: 'updateAppearanceSettings',
  tables: 'updateTablesSettings',
  regional: 'updateRegionalSettings',
};

export const settingsService = {
  getSettings,
  getGeneralSettings: (ctx) => getSectionSettings('general', ctx),
  getCompanySettings: (ctx) => getSectionSettings('company', ctx),
  getFleetSettings: (ctx) => getSectionSettings('fleet', ctx),
  getMaintenanceSettings: (ctx) => getSectionSettings('maintenance', ctx),
  getFuelSettings: (ctx) => getSectionSettings('fuel', ctx),
  getDocumentSettings: (ctx) => getSectionSettings('documents', ctx),
  getNotificationSettings: (ctx) => getSectionSettings('notifications', ctx),
  getUserSettings: (ctx) => getSectionSettings('user', ctx),
  getAppearanceSettings: (ctx) => getSectionSettings('appearance', ctx),
  getTablesSettings: (ctx) => getSectionSettings('tables', ctx),
  getRegionalSettings: (ctx) => getSectionSettings('regional', ctx),
  getBillingSettings: (ctx) => getSectionSettings('billing', ctx),
  getSaasSettings: (ctx) => getSectionSettings('saas', ctx),
  getSecuritySettings: (ctx) => getSectionSettings('security', ctx),
  getSystemSettings: (ctx) => getSectionSettings('system', ctx),

  updateSettings,
  updateGeneralSettings: (values, ctx) => updateSectionSettings('general', values, ctx),
  updateCompanySettings: (values, ctx) => updateSectionSettings('company', values, ctx),
  updateFleetSettings: (values, ctx) => updateSectionSettings('fleet', values, ctx),
  updateMaintenanceSettings: (values, ctx) => updateSectionSettings('maintenance', values, ctx),
  updateFuelSettings: (values, ctx) => updateSectionSettings('fuel', values, ctx),
  updateDocumentSettings: (values, ctx) => updateSectionSettings('documents', values, ctx),
  updateNotificationSettings: (values, ctx) => updateSectionSettings('notifications', values, ctx),
  updateUserSettings: (values, ctx) => updateSectionSettings('user', values, ctx),
  updateAppearanceSettings: (values, ctx) => updateSectionSettings('appearance', values, ctx),
  updateTablesSettings: (values, ctx) => updateSectionSettings('tables', values, ctx),
  updateRegionalSettings: (values, ctx) => updateSectionSettings('regional', values, ctx),

  getSectionSettings,
  updateSectionSettings,
  resetSectionSettings,
  resetAllSettings,
  resetUserPreferences,
};

export const SETTINGS_SECTION_GETTERS = SECTION_GETTERS;
export const SETTINGS_SECTION_UPDATERS = SECTION_UPDATERS;
