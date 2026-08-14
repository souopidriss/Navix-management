/**
 * Navix Management — Driver Navigation
 * --------------------------------------------------------------------------
 * Configuration du menu latéral exclusif au Chauffeur.
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
    label: 'Mon Activité',
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
    ],
  },
  {
    label: 'Maintenance',
    items: [
      {
        to: ROUTES.DRIVER_MAINTENANCE,
        icon: 'bi-wrench',
        label: 'Entretiens',
      },
    ],
  },
  {
    label: 'Carburant',
    items: [
      {
        to: ROUTES.DRIVER_FUEL,
        icon: 'bi-fuel-pump',
        label: 'Mon carburant',
      },
    ],
  },
  {
    label: 'Documents',
    items: [
      {
        to: ROUTES.DRIVER_DOCUMENTS,
        icon: 'bi-folder',
        label: 'Mes documents',
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
    ],
  },
];
