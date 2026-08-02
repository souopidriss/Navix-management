export const SIDEBAR_SECTIONS = [
  {
    label: 'Principal',
    items: [{ to: '/dashboard', label: 'Dashboard', icon: 'bi-speedometer2', end: true }],
  },
  {
    label: 'Gestion',
    items: [
      { to: '/dashboard/companies', label: 'Entreprises', icon: 'bi-buildings' },
      { to: '/dashboard/agencies', label: 'Agences', icon: 'bi-diagram-3' },
      { to: '/dashboard/vehicles', label: 'Véhicules', icon: 'bi-truck' },
      { to: '/dashboard/drivers', label: 'Chauffeurs', icon: 'bi-person-badge' },
      { to: '/dashboard/assignments', label: 'Affectations', icon: 'bi-shuffle' },
    ],
  },
  {
    label: 'Exploitation',
    items: [
      { to: '/dashboard/trips', label: 'Trajets', icon: 'bi-signpost-split' },
      { to: '/dashboard/fuel', label: 'Carburant', icon: 'bi-fuel-pump' },
      { to: '/dashboard/maintenance', label: 'Entretiens', icon: 'bi-wrench-adjustable' },
      { to: '/dashboard/files', label: 'Documents', icon: 'bi-folder2-open' },
    ],
  },
  {
    label: 'Finances',
    items: [
      { to: '/dashboard/invoices', label: 'Facturation', icon: 'bi-receipt' },
      { to: '/dashboard/subscriptions', label: 'Abonnements', icon: 'bi-credit-card' },
    ],
  },
  {
    label: 'Système',
    items: [
      { to: '/dashboard/notifications', label: 'Notifications', icon: 'bi-bell' },
      { to: '/dashboard/settings', label: 'Paramètres', icon: 'bi-gear' },
    ],
  },
];

export const ROUTE_LABELS = SIDEBAR_SECTIONS.flatMap((section) => section.items).reduce(
  (labels, item) => ({ ...labels, [item.to]: item.label }),
  {},
);
