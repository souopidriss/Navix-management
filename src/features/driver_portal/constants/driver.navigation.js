/**
 * Navix Management — Driver Navigation
 * --------------------------------------------------------------------------
 * Configuration du menu latéral exclusif au Chauffeur (Espace Chauffeur Premium).
 * Les entrées `action` (ex. 'logout') ne sont pas des routes : elles sont
 * rendues par DriverSidebar comme des actions locales.
 */
import { ROUTES } from '@/routes/route.constants';

export const DRIVER_SIDEBAR_SECTIONS = [
  {
    label: 'Principal',
    items: [
      {
        to: ROUTES.DRIVER_DASHBOARD,
        icon: 'bi-grid',
        label: 'Dashboard',
        end: true,
      },
    ],
  },
  {
    label: 'Exploitation',
    items: [
      {
        to: ROUTES.DRIVER_TRIPS,
        icon: 'bi-signpost-split',
        label: 'Mes trajets',
      },
      {
        to: ROUTES.DRIVER_VEHICLE,
        icon: 'bi-truck',
        label: 'Mon véhicule',
      },
      {
        to: ROUTES.DRIVER_FUEL,
        icon: 'bi-fuel-pump',
        label: 'Carburant',
      },
      {
        to: ROUTES.DRIVER_MAINTENANCE,
        icon: 'bi-wrench-adjustable',
        label: 'Entretiens',
      },
    ],
  },
  {
    label: 'Documents',
    items: [
      {
        to: ROUTES.DRIVER_DOCUMENTS,
        icon: 'bi-folder2-open',
        label: 'Documents',
      },
    ],
  },
  {
    label: 'Sécurité',
    items: [
      {
        to: ROUTES.DRIVER_INCIDENTS,
        icon: 'bi-shield-exclamation',
        label: 'Incidents',
      },
    ],
  },
  {
    label: 'Communication',
    items: [
      {
        to: ROUTES.DRIVER_NOTIFICATIONS,
        icon: 'bi-bell',
        label: 'Notifications',
      },
    ],
  },
  {
    label: 'Compte',
    items: [
      {
        to: ROUTES.DRIVER_PROFILE,
        icon: 'bi-person-circle',
        label: 'Mon profil',
      },
      {
        action: 'logout',
        icon: 'bi-box-arrow-right',
        label: 'Déconnexion',
      },
    ],
  },
];
