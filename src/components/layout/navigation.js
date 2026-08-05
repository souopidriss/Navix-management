import { ROUTES } from '@/routes/route.constants';

export const SIDEBAR_SECTIONS = [
  {
    label: 'Principal',
    items: [{ to: ROUTES.DASHBOARD, label: 'Dashboard', icon: 'bi-speedometer2', end: true }],
  },
  {
    label: 'Gestion',
    items: [
      { to: ROUTES.COMPANIES, label: 'Entreprises', icon: 'bi-buildings' },
      { to: ROUTES.AGENCIES, label: 'Agences', icon: 'bi-diagram-3' },
      { to: ROUTES.VEHICLES, label: 'Véhicules', icon: 'bi-truck' },
      { to: ROUTES.DRIVERS, label: 'Chauffeurs', icon: 'bi-person-badge' },
      { to: ROUTES.ASSIGNMENTS, label: 'Affectations', icon: 'bi-shuffle' },
    ],
  },
  {
    label: 'Exploitation',
    items: [
      { to: ROUTES.TRIPS, label: 'Trajets', icon: 'bi-signpost-split' },
      { to: ROUTES.FUEL, label: 'Carburant', icon: 'bi-fuel-pump' },
      { to: ROUTES.ENTRETIENS, label: 'Entretiens', icon: 'bi-wrench-adjustable' },
      { to: ROUTES.FILES, label: 'Documents', icon: 'bi-folder2-open' },
    ],
  },
  {
    label: 'Finances',
    items: [
      { to: ROUTES.BILLING, label: 'Facturation', icon: 'bi-receipt' },
      { to: ROUTES.SUBSCRIPTIONS, label: 'Abonnements', icon: 'bi-credit-card' },
    ],
  },
  {
    label: 'Système',
    items: [
      { to: ROUTES.NOTIFICATIONS, label: 'Notifications', icon: 'bi-bell' },
      { to: ROUTES.SETTINGS, label: 'Paramètres', icon: 'bi-gear' },
    ],
  },
];

export const ROUTE_LABELS = SIDEBAR_SECTIONS.flatMap((section) => section.items).reduce(
  (labels, item) => ({ ...labels, [item.to]: item.label }),
  { [ROUTES.PROFILE]: 'Profil' },
);
