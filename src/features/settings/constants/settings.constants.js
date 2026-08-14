/**
 * Navix Settings — Constantes du centre de configuration
 * --------------------------------------------------------------------------
 * Source unique de vérité pour les 14 sections de paramètres : ordre,
 * libellés, descriptions, icônes, routes et permission requise pour chaque
 * section. Contient aussi les listes d'options (langues, pays, fuseaux,
 * devises, formats, unités, types MIME…) partagées par les formulaires.
 *
 * Le multi-tenant est simulé : les paramètres d'entreprise / SaaS sont liés
 * à `companyId`, les préférences utilisateur à `userId`.
 */
import { ROUTES } from '@/routes/route.constants';
import { PERMISSIONS } from '@/features/rbac';
import {
  CURRENCIES,
  CURRENCY_VALUES,
  TAX_RATES,
  TAX_RATE_VALUES,
} from '@/features/billing/constants';
import { DOCUMENT_TYPES, DOCUMENT_TYPE_VALUES } from '@/features/documents/constants';

/* --------------------------------------------------------------------------
   Sections de paramètres (navigation)
   -------------------------------------------------------------------------- */

export const SETTINGS_GROUP_GENERAL = 'general';
export const SETTINGS_GROUP_OPERATIONS = 'operations';
export const SETTINGS_GROUP_ACCOUNT = 'account';
export const SETTINGS_GROUP_SYSTEM = 'system';

export const SETTINGS_SECTION_GROUPS = [
  { key: SETTINGS_GROUP_GENERAL, label: 'Général' },
  { key: SETTINGS_GROUP_OPERATIONS, label: 'Opérations' },
  { key: SETTINGS_GROUP_ACCOUNT, label: 'Compte & facturation' },
  { key: SETTINGS_GROUP_SYSTEM, label: 'Système' },
];

/**
 * Description de chaque section de paramètres.
 * `sensitive` : les modifications de cette section génèrent une entrée
 * d'audit simulée (journal des actions) en plus de la notification.
 */
export const SETTINGS_SECTIONS = [
  {
    key: 'general',
    label: 'Général',
    description: 'Identité, coordonnées et devise par défaut',
    icon: 'bi-sliders',
    route: ROUTES.SETTINGS_GENERAL,
    permission: PERMISSIONS.SETTINGS_UPDATE,
    group: SETTINGS_GROUP_GENERAL,
    sensitive: false,
  },
  {
    key: 'company',
    label: 'Entreprise',
    description: 'Informations légales et coordonnées',
    icon: 'bi-buildings',
    route: ROUTES.SETTINGS_COMPANY,
    permission: PERMISSIONS.SETTINGS_COMPANY,
    group: SETTINGS_GROUP_GENERAL,
    sensitive: true,
  },
  {
    key: 'regional',
    label: 'Régional',
    description: 'Langue, fuseau horaire et formats',
    icon: 'bi-globe2',
    route: ROUTES.SETTINGS_REGIONAL,
    permission: PERMISSIONS.SETTINGS_UPDATE,
    group: SETTINGS_GROUP_GENERAL,
    sensitive: false,
  },
  {
    key: 'appearance',
    label: 'Apparence',
    description: 'Thème, densité et animations',
    icon: 'bi-palette',
    route: ROUTES.SETTINGS_APPEARANCE,
    permission: PERMISSIONS.SETTINGS_UPDATE,
    group: SETTINGS_GROUP_GENERAL,
    sensitive: false,
  },
  {
    key: 'tables',
    label: 'Tableaux',
    description: 'Densité, colonnes et pagination des listes',
    icon: 'bi-table',
    route: ROUTES.SETTINGS_TABLES,
    permission: PERMISSIONS.SETTINGS_UPDATE,
    group: SETTINGS_GROUP_GENERAL,
    sensitive: false,
  },
  {
    key: 'fleet',
    label: 'Flotte',
    description: 'Unités et seuils d’alerte kilométrage',
    icon: 'bi-truck',
    route: ROUTES.SETTINGS_FLEET,
    permission: PERMISSIONS.SETTINGS_FLEET,
    group: SETTINGS_GROUP_OPERATIONS,
    sensitive: true,
  },
  {
    key: 'maintenance',
    label: 'Maintenance',
    description: 'Rappels et alertes d’entretien',
    icon: 'bi-wrench-adjustable',
    route: ROUTES.SETTINGS_MAINTENANCE,
    permission: PERMISSIONS.SETTINGS_MAINTENANCE,
    group: SETTINGS_GROUP_OPERATIONS,
    sensitive: true,
  },
  {
    key: 'fuel',
    label: 'Carburant',
    description: 'Devise, prix moyen et seuils de consommation',
    icon: 'bi-fuel-pump',
    route: ROUTES.SETTINGS_FUEL,
    permission: PERMISSIONS.SETTINGS_FUEL,
    group: SETTINGS_GROUP_OPERATIONS,
    sensitive: true,
  },
  {
    key: 'documents',
    label: 'Documents',
    description: 'Types pris en charge et alertes d’expiration',
    icon: 'bi-file-earmark-text',
    route: ROUTES.SETTINGS_DOCUMENTS,
    permission: PERMISSIONS.SETTINGS_DOCUMENTS,
    group: SETTINGS_GROUP_OPERATIONS,
    sensitive: true,
  },
  {
    key: 'notifications',
    label: 'Notifications',
    description: 'Canaux et préférences de notification',
    icon: 'bi-bell',
    route: ROUTES.SETTINGS_NOTIFICATIONS,
    permission: PERMISSIONS.SETTINGS_NOTIFICATIONS,
    group: SETTINGS_GROUP_OPERATIONS,
    sensitive: false,
  },
  {
    key: 'user',
    label: 'Utilisateur',
    description: 'Profil et préférences personnelles',
    icon: 'bi-person',
    route: ROUTES.SETTINGS_USER,
    permission: PERMISSIONS.SETTINGS_UPDATE,
    group: SETTINGS_GROUP_ACCOUNT,
    sensitive: false,
  },
  {
    key: 'billing',
    label: 'Facturation',
    description: 'Informations et préférences de facturation',
    icon: 'bi-receipt',
    route: ROUTES.SETTINGS_BILLING,
    permission: PERMISSIONS.SETTINGS_BILLING,
    group: SETTINGS_GROUP_ACCOUNT,
    sensitive: true,
  },
  {
    key: 'saas',
    label: 'SaaS',
    description: 'Plan, usage et limites',
    icon: 'bi-box-seam',
    route: ROUTES.SETTINGS_SAAS,
    permission: PERMISSIONS.SETTINGS_SAAS,
    group: SETTINGS_GROUP_ACCOUNT,
    sensitive: true,
  },
  {
    key: 'security',
    label: 'Sécurité',
    description: 'Sessions, appareils et accès (interface)',
    icon: 'bi-shield-lock',
    route: ROUTES.SETTINGS_SECURITY,
    permission: PERMISSIONS.SETTINGS_SECURITY,
    group: SETTINGS_GROUP_ACCOUNT,
    sensitive: true,
  },
  {
    key: 'system',
    label: 'Système',
    description: 'Version, environnement et statut',
    icon: 'bi-cpu',
    route: ROUTES.SETTINGS_SYSTEM,
    permission: PERMISSIONS.SETTINGS_SYSTEM,
    group: SETTINGS_GROUP_SYSTEM,
    sensitive: false,
  },
];

export const SETTINGS_SECTION_VALUES = SETTINGS_SECTIONS.map((section) => section.key);

/** @returns {object} — section de paramètres (défauts sûrs). */
export const getSettingsSection = (key) =>
  SETTINGS_SECTIONS.find((section) => section.key === key) ?? SETTINGS_SECTIONS[0];

/** Sections marquées sensibles (audit simulé à la sauvegarde). */
export const SENSITIVE_SETTINGS_SECTIONS = SETTINGS_SECTIONS.filter(
  (section) => section.sensitive,
).map((section) => section.key);

/* --------------------------------------------------------------------------
   Options de formulaires
   -------------------------------------------------------------------------- */

export const LANGUAGES = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'ar', label: 'العربية' },
  { value: 'de', label: 'Deutsch' },
];

export const COUNTRIES = [
  { value: 'CM', label: 'Cameroun' },
  { value: 'NG', label: 'Nigéria' },
  { value: 'TD', label: 'Tchad' },
  { value: 'CF', label: 'République centrafricaine' },
  { value: 'GQ', label: 'Guinée équatoriale' },
  { value: 'GA', label: 'Gabon' },
  { value: 'CG', label: 'République du Congo' },
  { value: 'CD', label: 'République démocratique du Congo' },
];

export const TIMEZONES = [
  { value: 'UTC', label: 'UTC (Temps universel)' },
  { value: 'Africa/Douala', label: 'Afrique — Douala (GMT+1)' },
  { value: 'Africa/Lagos', label: 'Afrique — Lagos (GMT+1)' },
  { value: 'Europe/Paris', label: 'Europe — Paris (GMT+1)' },
  { value: 'Europe/Brussels', label: 'Europe — Bruxelles (GMT+1)' },
  { value: 'America/New_York', label: 'Amérique — New York (GMT-5)' },
  { value: 'Asia/Dubai', label: 'Asie — Dubaï (GMT+4)' },
];

export const DATE_FORMATS = [
  { value: 'DD/MM/YYYY', label: 'JJ/MM/AAAA (31/12/2026)' },
  { value: 'MM/DD/YYYY', label: 'MM/JJ/AAAA (12/31/2026)' },
  { value: 'YYYY-MM-DD', label: 'AAAA-MM-JJ (2026-12-31)' },
  { value: 'DD MMMM YYYY', label: 'JJ Mois AAAA (31 décembre 2026)' },
];

export const TIME_FORMATS = [
  { value: 'HH:mm', label: '24 heures (14:05)' },
  { value: 'hh:mm A', label: '12 heures (02:05 PM)' },
];

export const FIRST_DAYS_OF_WEEK = [
  { value: 'monday', label: 'Lundi' },
  { value: 'sunday', label: 'Dimanche' },
];

export const NUMBER_LOCALES = [
  { value: 'fr-FR', label: 'Français (fr-FR)' },
  { value: 'en-US', label: 'English (en-US)' },
  { value: 'en-GB', label: 'English (en-GB)' },
  { value: 'de-DE', label: 'Deutsch (de-DE)' },
];

export const DECIMAL_SEPARATORS = [
  { value: ',', label: 'Virgule (,)' },
  { value: '.', label: 'Point (.)' },
];

export const THOUSAND_SEPARATORS = [
  { value: ' ', label: 'Espace (1 000)' },
  { value: ',', label: 'Virgule (1,000)' },
  { value: '.', label: 'Point (1.000)' },
  { value: 'none', label: 'Aucun (1000)' },
];

export const DISTANCE_UNITS = [
  { value: 'km', label: 'Kilomètre (km)' },
  { value: 'mi', label: 'Mile (mi)' },
];

export const CONSUMPTION_UNITS = [
  { value: 'l100km', label: 'L / 100 km' },
  { value: 'kml', label: 'km / L' },
];

export const FUEL_UNITS = [
  { value: 'liter', label: 'Litre (L)' },
  { value: 'gallon', label: 'Gallon (gal)' },
];

export const EXPIRATION_ALERT_DAYS = [30, 15, 7, 3, 1];

export const DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/msword',
];

export const UI_DENSITIES = [
  { value: 'compact', label: 'Compact', description: 'Moins d’espacement, plus d’information' },
  { value: 'normal', label: 'Normal', description: 'Espacement standard' },
  { value: 'comfortable', label: 'Comfortable', description: 'Espacement généreux' },
];

export const SIDEBAR_MODES = [
  { value: 'expanded', label: 'Sidebar étendue', description: 'Navigation complète' },
  { value: 'compact', label: 'Sidebar compacte', description: 'Icônes uniquement' },
];

export const CURRENCY_DISPLAYS = [
  { value: 'symbol', label: 'Symbole (ex. 1 250 FCFA)' },
  { value: 'code', label: 'Code (ex. 1 250 XAF)' },
  { value: 'full', label: 'Libellé (ex. 1 250 Franc CFA)' },
];

/** Pages d'accueil autorisées (parcours existant, gardes inchangées). */
export const LANDING_PAGES = [
  { value: ROUTES.DASHBOARD, label: 'Tableau de bord' },
  { value: ROUTES.VEHICLES, label: 'Véhicules' },
  { value: ROUTES.DRIVERS, label: 'Chauffeurs' },
  { value: ROUTES.TRIPS, label: 'Trajets' },
  { value: ROUTES.FUEL, label: 'Carburant' },
  { value: ROUTES.ENTRETIENS, label: 'Entretiens' },
  { value: ROUTES.FILES, label: 'Documents' },
  { value: ROUTES.REPORTS, label: 'Rapports' },
  { value: ROUTES.SETTINGS, label: 'Paramètres' },
];

export const ITEMS_PER_PAGE_OPTIONS = [10, 20, 50, 100];

export const DOCUMENT_VIEWS = [
  { value: 'list', label: 'Liste', description: 'Tableau avec colonnes' },
  { value: 'grid', label: 'Grille', description: 'Cartes en grille' },
];

export const DOCUMENT_SORTS = [
  { value: 'recent', label: 'Plus récents' },
  { value: 'name', label: 'Nom (A → Z)' },
  { value: 'type', label: 'Type' },
  { value: 'size', label: 'Taille' },
];

export const TABLE_SORTS = [
  { value: 'createdAt', label: 'Date de création' },
  { value: 'name', label: 'Nom' },
  { value: 'status', label: 'Statut' },
  { value: 'updatedAt', label: 'Dernière mise à jour' },
];

export const SORT_DIRECTIONS = [
  { value: 'asc', label: 'Croissant (A → Z)' },
  { value: 'desc', label: 'Décroissant (Z → A)' },
];

/** Colonnes génériques communes aux listes (configuration générique des tableaux). */
export const TABLE_COLUMNS = [
  { value: 'identity', label: 'Identité (nom, référence)' },
  { value: 'status', label: 'Statut' },
  { value: 'dates', label: 'Dates' },
  { value: 'amounts', label: 'Montants' },
  { value: 'actions', label: 'Actions' },
];

/** Sections relevant des préférences utilisateur (reset sans toucher l'entreprise). */
export const USER_SCOPE_SECTIONS = ['user', 'appearance', 'regional', 'tables', 'notifications'];

export { CURRENCIES, CURRENCY_VALUES, TAX_RATES, TAX_RATE_VALUES };
export { DOCUMENT_TYPES, DOCUMENT_TYPE_VALUES };

/** Options de devises au format [{ value, label }] pour les formulaires. */
export const CURRENCY_OPTIONS = Object.entries(CURRENCIES).map(([value, meta]) => ({
  value,
  label: meta.label,
}));

/** Options de taux de taxe au format [{ value, label }] pour les formulaires. */
export const TAX_RATE_OPTIONS = TAX_RATE_VALUES.map((value) => ({
  value: String(value),
  label: TAX_RATES[value].label,
}));

/** Options de types de documents au format [{ value, label }]. */
export const DOCUMENT_TYPE_OPTIONS = Object.entries(DOCUMENT_TYPES).map(([value, meta]) => ({
  value,
  label: meta.label,
}));
