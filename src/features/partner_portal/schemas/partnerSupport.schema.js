/**
 * Navix Partner Portal — Schémas Zod Support & Assistance (PROMPT 077)
 * ───────────────────────────────────────────────────────────────────────
 * Validation pour les filtres, création et réponse de tickets.
 */
import { z } from 'zod';

/* ─── Options de filtres ─── */

export const TICKET_STATUS_OPTIONS = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'open', label: 'Ouvert' },
  { value: 'in_progress', label: 'En cours' },
  { value: 'waiting_for_partner', label: 'En attente (vous)' },
  { value: 'waiting_for_support', label: 'En attente (support)' },
  { value: 'resolved', label: 'Résolu' },
  { value: 'closed', label: 'Fermé' },
];

export const TICKET_PRIORITY_OPTIONS = [
  { value: 'all', label: 'Toutes les priorités' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'Haute' },
  { value: 'medium', label: 'Moyenne' },
  { value: 'low', label: 'Basse' },
];

export const TICKET_CATEGORY_OPTIONS = [
  { value: 'all', label: 'Toutes les catégories' },
  { value: 'compte', label: 'Compte' },
  { value: 'vehicules', label: 'Véhicules' },
  { value: 'missions', label: 'Missions' },
  { value: 'finance', label: 'Finance' },
  { value: 'facturation', label: 'Facturation' },
  { value: 'documents', label: 'Documents' },
  { value: 'contrats', label: 'Contrats' },
  { value: 'technique', label: 'Technique' },
  { value: 'autre', label: 'Autre' },
];

export const TICKET_SORT_OPTIONS = [
  { value: 'createdAt', label: 'Date de création' },
  { value: 'updatedAt', label: 'Dernière activité' },
  { value: 'priority', label: 'Priorité' },
  { value: 'status', label: 'Statut' },
];

/* ─── Enums Zod ─── */

export const TICKET_STATUS_ENUM = z.enum([
  'open',
  'in_progress',
  'waiting_for_partner',
  'waiting_for_support',
  'resolved',
  'closed',
]);

export const TICKET_PRIORITY_ENUM = z.enum(['low', 'medium', 'high', 'urgent']);

export const TICKET_CATEGORY_ENUM = z.enum([
  'compte',
  'vehicules',
  'missions',
  'finance',
  'facturation',
  'documents',
  'contrats',
  'technique',
  'autre',
]);

/* ─── Schéma filtres ─── */

export const ticketFiltersSchema = z.object({
  search: z.string().default(''),
  status: z.enum(['all', 'open', 'in_progress', 'waiting_for_partner', 'waiting_for_support', 'resolved', 'closed']).default('all'),
  priority: z.enum(['all', 'urgent', 'high', 'medium', 'low']).default('all'),
  category: z.string().default('all'),
  sortBy: z.enum(['createdAt', 'updatedAt', 'priority', 'status']).default('createdAt'),
  sortDirection: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(10),
});

/* ─── Schéma création ticket ─── */

export const ticketCreateSchema = z.object({
  subject: z
    .string()
    .min(5, 'Le sujet doit contenir au moins 5 caractères')
    .max(200, 'Le sujet ne doit pas dépasser 200 caractères'),
  category: TICKET_CATEGORY_ENUM,
  priority: TICKET_PRIORITY_ENUM,
  description: z
    .string()
    .min(10, 'La description doit contenir au moins 10 caractères')
    .max(5000, 'La description ne doit pas dépasser 5 000 caractères'),
  referenceId: z.string().optional().default(''),
  entityType: z.enum(['', 'vehicle', 'mission', 'invoice', 'contract', 'document']).optional().default(''),
  entityId: z.string().optional().default(''),
});

export const TICKET_CREATE_DEFAULTS = {
  subject: '',
  category: 'technique',
  priority: 'medium',
  description: '',
  referenceId: '',
  entityType: '',
  entityId: '',
};

/* ─── Schéma réponse ticket ─── */

export const ticketReplySchema = z.object({
  content: z
    .string()
    .min(5, 'La réponse doit contenir au moins 5 caractères')
    .max(5000, 'La réponse ne doit pas dépasser 5 000 caractères'),
});

export const TICKET_REPLY_DEFAULTS = {
  content: '',
};

/* ─── Helpers statuts ─── */

export const TICKET_STATUS_CONFIG = {
  open: { label: 'Ouvert', variant: 'primary', icon: 'bi-folder2-open' },
  in_progress: { label: 'En cours', variant: 'info', icon: 'bi-arrow-repeat' },
  waiting_for_partner: { label: 'En attente (vous)', variant: 'warning', icon: 'bi-person-clock' },
  waiting_for_support: { label: 'En attente (support)', variant: 'secondary', icon: 'bi-headset' },
  resolved: { label: 'Résolu', variant: 'success', icon: 'bi-check-circle' },
  closed: { label: 'Fermé', variant: 'light', icon: 'bi-lock' },
};

/* ─── Helpers priorités ─── */

export const TICKET_PRIORITY_CONFIG = {
  urgent: { label: 'Urgent', variant: 'danger', icon: 'bi-lightning-fill' },
  high: { label: 'Haute', variant: 'warning', icon: 'bi-arrow-up' },
  medium: { label: 'Moyenne', variant: 'info', icon: 'bi-dash' },
  low: { label: 'Basse', variant: 'secondary', icon: 'bi-arrow-down' },
};

/* ─── Helpers catégories ─── */

export const TICKET_CATEGORY_CONFIG = {
  compte: { label: 'Compte', icon: 'bi-person-gear' },
  vehicules: { label: 'Véhicules', icon: 'bi-truck' },
  missions: { label: 'Missions', icon: 'bi-signpost-split' },
  finance: { label: 'Finance', icon: 'bi-cash-stack' },
  facturation: { label: 'Facturation', icon: 'bi-receipt' },
  documents: { label: 'Documents', icon: 'bi-folder2-open' },
  contrats: { label: 'Contrats', icon: 'bi-file-earmark-text' },
  technique: { label: 'Technique', icon: 'bi-tools' },
  autre: { label: 'Autre', icon: 'bi-three-dots' },
};

export const getTicketStatus = (value) =>
  TICKET_STATUS_CONFIG[value] || { label: value, variant: 'secondary', icon: 'bi-circle' };

export const getTicketPriority = (value) =>
  TICKET_PRIORITY_CONFIG[value] || { label: value, variant: 'secondary', icon: 'bi-circle' };

export const getTicketCategory = (value) =>
  TICKET_CATEGORY_CONFIG[value] || { label: value, icon: 'bi-question-circle' };

/* ─── Constantes ─── */

export const TICKET_PAGE_SIZE_OPTIONS = [10, 25, 50];

export const PRIORITY_ORDER = { urgent: 0, high: 1, medium: 2, low: 3 };
