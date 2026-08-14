/**
 * Navix Client — Navigation dédiée à l'Espace Client
 * --------------------------------------------------------------------------
 * Sections et éléments de menu pour l'Espace Client (Entreprise et Particulier).
 * Les éléments sont automatiquement filtrés selon le clientType (enterprise vs individual).
 */
import { ROUTES } from '@/routes/route.constants';
import { CLIENT_TYPES } from './client.constants';

export const CLIENT_SIDEBAR_SECTIONS = [
  {
    label: 'PRINCIPAL',
    items: [
      { to: ROUTES.CLIENT_DASHBOARD, label: 'Dashboard', icon: 'bi-speedometer2', end: true },
    ],
  },
  {
    label: 'GESTION',
    items: [
      { to: ROUTES.CLIENT_SERVICES, label: 'Mes services', icon: 'bi-grid-fill' },
      {
        to: ROUTES.CLIENT_VEHICLES,
        label: 'Mes véhicules',
        icon: 'bi-truck',
        clientTypes: [CLIENT_TYPES.ENTERPRISE],
      },
      { to: ROUTES.CLIENT_REQUESTS, label: 'Mes demandes', icon: 'bi-clipboard-plus' },
      { to: ROUTES.CLIENT_TRIPS, label: 'Mes trajets', icon: 'bi-signpost-split' },
    ],
  },
  {
    label: 'DOCUMENTS',
    items: [
      { to: ROUTES.CLIENT_DOCUMENTS, label: 'Mes documents', icon: 'bi-folder2-open' },
      { to: ROUTES.CLIENT_INVOICES, label: 'Mes factures', icon: 'bi-receipt' },
    ],
  },
  {
    label: 'COMMUNICATION',
    items: [
      { to: ROUTES.CLIENT_NOTIFICATIONS, label: 'Notifications', icon: 'bi-bell' },
    ],
  },
  {
    label: 'COMPTE',
    items: [
      { to: ROUTES.CLIENT_PROFILE, label: 'Mon profil', icon: 'bi-person-circle' },
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
