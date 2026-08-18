/**
 * Navix Partner Portal — Navigation dédiée à l'Espace Partenaire
 * --------------------------------------------------------------------------
 * Sections et éléments de menu de l'Espace Partenaire (PROMPT 061) :
 *
 *   TABLEAU DE BORD
 *   EXPLOITATION      → Demandes, Véhicules, Missions, Contrats
 *   RELATIONS         → Clients
 *   FINANCE           → Finance (Fonds, Transactions)
 *   DOCUMENTS         → Documents
 *   COMMUNICATION     → Notifications
 *   PARAMÈTRES        → Profil, Paramètres
 *
 * Chaque entrée est couverte par ROUTE_META (/partner/*) — rôle Partenaire.
 */
import { ROUTES } from '@/routes/route.constants';

export const PARTNER_SIDEBAR_SECTIONS = [
  {
    label: 'TABLEAU DE BORD',
    items: [
      { to: ROUTES.PARTNER_DASHBOARD, label: 'Dashboard', icon: 'bi-speedometer2', end: true },
    ],
  },
  {
    label: 'EXPLOITATION',
    items: [
      { to: ROUTES.PARTNER_REQUESTS, label: 'Demandes', icon: 'bi-inbox' },
      { to: ROUTES.PARTNER_VEHICLES, label: 'Véhicules', icon: 'bi-truck' },
      { to: ROUTES.PARTNER_MISSIONS, label: 'Missions', icon: 'bi-signpost-split' },
      { to: ROUTES.PARTNER_CONTRACTS, label: 'Contrats', icon: 'bi-file-earmark-text' },
    ],
  },
  {
    label: 'RELATIONS',
    items: [
      { to: ROUTES.PARTNER_CLIENTS, label: 'Clients', icon: 'bi-people' },
    ],
  },
  {
    label: 'FINANCE',
    items: [
      { to: ROUTES.PARTNER_FINANCE, label: 'Finance', icon: 'bi-cash-stack' },
      { to: ROUTES.PARTNER_FINANCE_FUNDS, label: 'Fonds', icon: 'bi-wallet2' },
      { to: ROUTES.PARTNER_FINANCE_TRANSACTIONS, label: 'Transactions', icon: 'bi-arrow-repeat' },
      { to: ROUTES.PARTNER_FINANCE_REVENUE, label: 'Revenus', icon: 'bi-cash-coin' },
      { to: ROUTES.PARTNER_FINANCE_INVOICES, label: 'Factures', icon: 'bi-receipt' },
    ],
  },
  {
    label: 'DOCUMENTS',
    items: [
      { to: ROUTES.PARTNER_DOCUMENTS, label: 'Documents', icon: 'bi-folder2-open' },
    ],
  },
  {
    label: 'COMMUNICATION',
    items: [
      { to: ROUTES.PARTNER_NOTIFICATIONS, label: 'Notifications', icon: 'bi-bell' },
      { to: ROUTES.PARTNER_ALERTS, label: 'Alertes', icon: 'bi-exclamation-triangle' },
    ],
  },
  {
    label: 'ANALYSE',
    items: [
      { to: ROUTES.PARTNER_ANALYTICS, label: 'Performance', icon: 'bi-graph-up' },
    ],
  },
  {
    label: 'PLANIFICATION',
    items: [
      { to: ROUTES.PARTNER_CALENDAR, label: 'Calendrier', icon: 'bi-calendar3' },
    ],
  },
  {
    label: 'ASSISTANCE',
    items: [
      { to: ROUTES.PARTNER_SUPPORT, label: 'Support', icon: 'bi-headset' },
    ],
  },
  {
    label: 'PARAMÈTRES',
    items: [
      { to: ROUTES.PARTNER_PROFILE, label: 'Profil', icon: 'bi-person-circle' },
      { to: ROUTES.PARTNER_SETTINGS, label: 'Paramètres', icon: 'bi-gear' },
    ],
  },
];
