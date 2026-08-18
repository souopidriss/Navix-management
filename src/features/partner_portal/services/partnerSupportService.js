/**
 * Navix Partner Portal — Service Support & Assistance (PROMPT 077)
 * ───────────────────────────────────────────────────────────────────
 * Service de gestion des tickets de support partenaire.
 * Filtre par companyId + partnerId pour l'isolation multi-tenant.
 * Ne crée pas de système parallèle — réutilise les mocks existants.
 */
import {
  MOCK_PARTNER_SUPPORT_TICKETS,
  generateSupportTicketId,
  generateSupportReference,
} from '../mocks/partnerSupport.mock';
import { PARTNER_COMPANY_ID, PARTNER_PARTNER_ID } from '../constants/partner.constants';
import { PRIORITY_ORDER } from '../schemas/partnerSupport.schema';

/* ─── Simule un délai réseau ─── */
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

/* ─── Copie locale des mocks (mutables pour démo) ─── */
let _tickets = [...MOCK_PARTNER_SUPPORT_TICKETS];

/**
 * Récupère les tickets filtrés par companyId + partnerId.
 * Applique recherche, filtres, tri et pagination côté client.
 */
export const getTickets = async ({
  search = '',
  status = 'all',
  priority = 'all',
  category = 'all',
  sortBy = 'createdAt',
  sortDirection = 'desc',
  page = 1,
  pageSize = 10,
} = {}) => {
  await delay();

  let results = _tickets.filter(
    (t) => t.companyId === PARTNER_COMPANY_ID && t.partnerId === PARTNER_PARTNER_ID,
  );

  /* Recherche texte */
  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    results = results.filter(
      (t) =>
        t.reference.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.messages.some((m) => m.content.toLowerCase().includes(q)),
    );
  }

  /* Filtres */
  if (status !== 'all') {
    results = results.filter((t) => t.status === status);
  }
  if (priority !== 'all') {
    results = results.filter((t) => t.priority === priority);
  }
  if (category !== 'all') {
    results = results.filter((t) => t.category === category);
  }

  /* Tri */
  results.sort((a, b) => {
    let cmp = 0;
    if (sortBy === 'priority') {
      cmp = (PRIORITY_ORDER[a.priority] ?? 99) - (PRIORITY_ORDER[b.priority] ?? 99);
    } else if (sortBy === 'status') {
      cmp = a.status.localeCompare(b.status);
    } else {
      const dateA = new Date(a[sortBy] || a.createdAt).getTime();
      const dateB = new Date(b[sortBy] || b.createdAt).getTime();
      cmp = dateA - dateB;
    }
    return sortDirection === 'asc' ? cmp : -cmp;
  });

  const total = results.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const items = results.slice(start, start + pageSize);

  return { items, total, totalPages, page: safePage };
};

/**
 * Récupère un ticket par son ID (isolation multi-tenant).
 * Retourne null si le ticket n'existe pas ou appartient à un autre tenant.
 */
export const getTicketById = async (ticketId) => {
  await delay(200);

  const ticket = _tickets.find(
    (t) =>
      t.id === ticketId &&
      t.companyId === PARTNER_COMPANY_ID &&
      t.partnerId === PARTNER_PARTNER_ID,
  );

  return ticket || null;
};

/**
 * Statistiques des tickets du partenaire.
 */
export const getTicketStats = async () => {
  await delay(200);

  const partnerTickets = _tickets.filter(
    (t) => t.companyId === PARTNER_COMPANY_ID && t.partnerId === PARTNER_PARTNER_ID,
  );

  const total = partnerTickets.length;
  const open = partnerTickets.filter((t) => t.status === 'open').length;
  const inProgress = partnerTickets.filter((t) => t.status === 'in_progress').length;
  const waitingForPartner = partnerTickets.filter((t) => t.status === 'waiting_for_partner').length;
  const waitingForSupport = partnerTickets.filter((t) => t.status === 'waiting_for_support').length;
  const resolved = partnerTickets.filter((t) => t.status === 'resolved').length;
  const closed = partnerTickets.filter((t) => t.status === 'closed').length;
  const awaitingResponse = waitingForPartner;

  return {
    total,
    open,
    inProgress,
    waitingForPartner,
    waitingForSupport,
    resolved,
    closed,
    awaitingResponse,
  };
};

/**
 * Nombre de tickets nécessitant une réponse du partenaire (pour le badge sidebar).
 */
export const getAwaitingResponseCount = async () => {
  await delay(100);

  return _tickets.filter(
    (t) =>
      t.companyId === PARTNER_COMPANY_ID &&
      t.partnerId === PARTNER_PARTNER_ID &&
      t.status === 'waiting_for_partner',
  ).length;
};

/**
 * Crée un nouveau ticket de support.
 */
export const createTicket = async (payload) => {
  await delay(500);

  const now = new Date().toISOString();
  const id = generateSupportTicketId();
  const reference = generateSupportReference();

  const newTicket = {
    id,
    companyId: PARTNER_COMPANY_ID,
    partnerId: PARTNER_PARTNER_ID,
    reference,
    subject: payload.subject,
    category: payload.category,
    priority: payload.priority,
    status: 'open',
    entityType: payload.entityType || null,
    entityId: payload.entityId || null,
    entityLabel: payload.entityLabel || null,
    createdAt: now,
    updatedAt: now,
    messages: [
      {
        id: `msg_${id}_1`,
        author: 'Partenaire',
        authorRole: 'partner',
        content: payload.description,
        createdAt: now,
      },
    ],
    attachments: payload.attachments || [],
  };

  _tickets = [newTicket, ..._tickets];
  return newTicket;
};

/**
 * Répond à un ticket existant.
 * Met à jour le statut et ajoute le message.
 */
export const replyToTicket = async (ticketId, payload) => {
  await delay(400);

  const idx = _tickets.findIndex(
    (t) =>
      t.id === ticketId &&
      t.companyId === PARTNER_COMPANY_ID &&
      t.partnerId === PARTNER_PARTNER_ID,
  );

  if (idx === -1) return null;

  const ticket = _tickets[idx];
  if (ticket.status === 'closed') return null;

  const now = new Date().toISOString();
  const newMessage = {
    id: `msg_${ticketId}_${ticket.messages.length + 1}`,
    author: 'Partenaire',
    authorRole: 'partner',
    content: payload.content,
    createdAt: now,
  };

  const updated = {
    ...ticket,
    status: 'waiting_for_support',
    updatedAt: now,
    messages: [...ticket.messages, newMessage],
  };

  _tickets[idx] = updated;
  return updated;
};

/**
 * Met à jour le statut d'un ticket (close, réouvre, etc.)
 */
export const updateTicketStatus = async (ticketId, status) => {
  await delay(300);

  const idx = _tickets.findIndex(
    (t) =>
      t.id === ticketId &&
      t.companyId === PARTNER_COMPANY_ID &&
      t.partnerId === PARTNER_PARTNER_ID,
  );

  if (idx === -1) return null;

  const now = new Date().toISOString();
  const updated = {
    ..._tickets[idx],
    status,
    updatedAt: now,
  };

  _tickets[idx] = updated;
  return updated;
};
