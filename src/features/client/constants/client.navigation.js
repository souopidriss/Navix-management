/**
 * Navix Client — Navigation dédiée à l'Espace Client
 * --------------------------------------------------------------------------
 * Sections et éléments de menu pour l'Espace Client (Entreprise et Particulier),
 * conformes à la structure Phase 3 (PROMPT 054) :
 *
 *   TABLEAU DE BORD
 *   FLOTTE            → Véhicules, Chauffeurs, Affectations
 *   EXPLOITATION      → Trajets, Maintenance, Carburant
 *   SERVICES          → Mes services, Mes demandes
 *   DOCUMENTS & RAPPORTS → Documents, Factures, Rapports
 *   COMMUNICATION     → Notifications
 *   FINANCE           → Fonds, Transactions
 *   PARAMÈTRES        → Profil
 *
 * Les éléments sont automatiquement filtrés selon le clientType (enterprise vs
 * individual) via `clientTypes`. Les modules flotte / finance sont réservés à
 * l'entreprise (isolation RBAC : le Particulier n'a pas ces permissions).
 */
import { ROUTES } from '@/routes/route.constants';
import { CLIENT_TYPES } from './client.constants';

export const CLIENT_SIDEBAR_SECTIONS = [
  {
    label: 'TABLEAU DE BORD',
    items: [
      { to: ROUTES.CLIENT_DASHBOARD, label: 'Dashboard', icon: 'bi-speedometer2', end: true },
    ],
  },
  {
    label: 'FLOTTE',
    items: [
      { to: ROUTES.CLIENT_VEHICLES, label: 'Véhicules', icon: 'bi-truck', clientTypes: [CLIENT_TYPES.ENTERPRISE] },
      { to: ROUTES.CLIENT_DRIVERS, label: 'Chauffeurs', icon: 'bi-person-vcard', clientTypes: [CLIENT_TYPES.ENTERPRISE] },
      { to: ROUTES.CLIENT_ASSIGNMENTS, label: 'Affectations', icon: 'bi-arrow-left-right', clientTypes: [CLIENT_TYPES.ENTERPRISE] },
    ],
  },
  {
    label: 'EXPLOITATION',
    items: [
      { to: ROUTES.CLIENT_TRIPS, label: 'Trajets', icon: 'bi-signpost-split' },
      { to: ROUTES.CLIENT_MAINTENANCE, label: 'Maintenance', icon: 'bi-wrench-adjustable', clientTypes: [CLIENT_TYPES.ENTERPRISE] },
      { to: ROUTES.CLIENT_FUEL, label: 'Carburant', icon: 'bi-fuel-pump', clientTypes: [CLIENT_TYPES.ENTERPRISE] },
    ],
  },
  {
    label: 'SERVICES',
    items: [
      { to: ROUTES.CLIENT_SERVICES, label: 'Mes services', icon: 'bi-grid-fill' },
      { to: ROUTES.CLIENT_REQUESTS, label: 'Mes demandes', icon: 'bi-clipboard-plus' },
    ],
  },
  {
    label: 'DOCUMENTS & RAPPORTS',
    items: [
      { to: ROUTES.CLIENT_DOCUMENTS, label: 'Documents', icon: 'bi-folder2-open' },
      { to: ROUTES.CLIENT_INVOICES, label: 'Mes factures', icon: 'bi-receipt' },
      { to: ROUTES.CLIENT_REPORTS, label: 'Rapports', icon: 'bi-bar-chart-line', clientTypes: [CLIENT_TYPES.ENTERPRISE] },
    ],
  },
  {
    label: 'COMMUNICATION',
    items: [
      { to: ROUTES.CLIENT_NOTIFICATIONS, label: 'Notifications', icon: 'bi-bell' },
    ],
  },
  {
    label: 'FINANCE',
    items: [
      { to: ROUTES.CLIENT_FINANCE_FUNDS, label: 'Fonds', icon: 'bi-wallet2', clientTypes: [CLIENT_TYPES.ENTERPRISE] },
      { to: ROUTES.CLIENT_FINANCE_TRANSACTIONS, label: 'Transactions', icon: 'bi-arrow-repeat', clientTypes: [CLIENT_TYPES.ENTERPRISE] },
    ],
  },
  {
    label: 'PARAMÈTRES',
    items: [
      { to: ROUTES.CLIENT_PROFILE, label: 'Profil', icon: 'bi-person-circle' },
    ],
  },
];

/**
 * Filtre les sections de la navigation Client selon le type de client (enterprise / individual).
 * @param {Array} sections
 * @param {string} clientType
 * @returns {Array}
 */
export const filterClientSidebarSections = (sections, clientType = CLIENT_TYPES.ENTERPRISE) =>
  sections
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) => !item.clientTypes || item.clientTypes.includes(clientType),
      ),
    }))
    .filter((section) => section.items.length > 0);
