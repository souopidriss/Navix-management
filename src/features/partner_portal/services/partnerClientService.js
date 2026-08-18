/**
 * Navix Partner Portal — Service Clients Partenaire (PROMPT 065)
 * --------------------------------------------------------------------------
 * Gestion complète des clients de l'entreprise partenaire, strictement
 * isolée multi-tenant : le Partenaire ne voit que les clients liés à
 * `companyId` = `PARTNER_COMPANY_ID` (cmp_partner_navix) et à son
 * `partnerId`. Le `companyId` / `partnerId` sont TOUJOURS appliqués côté
 * service simulé — jamais depuis l'UI (aucun companyId de formulaire n'est
 * jamais accepté).
 *
 * Source unique de vérité :
 *   - les clients vivent dans un cache local (copie du mock) ;
 *   - les agrégats (missions, revenus, dernière mission) sont RECOMPUTÉS
 *     depuis le module Missions Partenaire (cache de partnerMissionService)
 *     via le lien `missionClients` — les mocks ne sont pas dupliqués ;
 *   - l'archivage est une désactivation douce : les données ne sont jamais
 *     supprimées définitivement.
 *
 * Règles métier : statuts active | inactive | archived. Un client archivé
 * ne reçoit plus l'action « Archiver ». Monnaie : FCFA (XAF) uniquement.
 */
import { mockResponse } from '@/services/utils';
import { ApiError } from '@/services/errors';
import { MOCK_PARTNER_CLIENTS } from '../mocks/partner.mock';
import { getPartnerMissionsCache } from './partnerMissionService';
import {
  PARTNER_COMPANY_ID,
  PARTNER_PARTNER_ID,
} from '../constants/partner.constants';

let clientCache = null;

const getClientCache = () => {
  if (!clientCache) {
    clientCache = MOCK_PARTNER_CLIENTS.map((client) => ({ ...client }));
  }
  return clientCache;
};

/** Getter public du cache clients (lecture pour agrégations, copie défensive). */
export const getPartnerClientsCache = () => getClientCache().map((client) => ({ ...client }));

const isInScope = (client) =>
  client.companyId === PARTNER_COMPANY_ID && client.partnerId === PARTNER_PARTNER_ID;

/** Missions du client : enregistrements réels du module Missions (lien nom). */
const getLinkedMissions = (client) => {
  const links = client.missionClients ?? [];
  if (links.length === 0) return [];
  const needle = links.map((name) => String(name).toLowerCase());
  return getPartnerMissionsCache().filter((mission) => needle.includes(String(mission.client).toLowerCase()));
};

/**
 * Recompte les agrégats d'un client depuis les missions réelles (source
 * unique) — missions, répartition par statut, revenus des terminées (FCFA),
 * dernière mission, montant moyen par mission.
 * @param {object} client
 * @returns {object}
 */
const buildClientSummary = (client) => {
  const linked = getLinkedMissions(client);
  const byStatus = (status) => linked.filter((mission) => mission.status === status);
  const completed = byStatus('completed');
  const inProgress = byStatus('in_progress');
  const scheduled = byStatus('scheduled');
  const cancelled = byStatus('cancelled');
  const revenue = completed.reduce((sum, mission) => sum + (Number(mission.amount) || 0), 0);
  const lastMissionDate = linked.reduce(
    (latest, mission) => (mission.startDate && (!latest || mission.startDate > latest) ? mission.startDate : latest),
    null,
  );
  const missionsCount = linked.length;

  return {
    missionsCount,
    completedMissions: completed.length,
    inProgressMissions: inProgress.length,
    scheduledMissions: scheduled.length,
    cancelledMissions: cancelled.length,
    revenue,
    averagePerMission: missionsCount ? Math.round(revenue / missionsCount) : 0,
    lastMissionDate,
    lastPaymentDate: client.lastPaymentDate ?? null,
  };
};

/** Client public : données + agrégats recomputés (copie défensive). */
const toPublicClient = (client) => ({ ...client, ...buildClientSummary(client) });

/** Génère la prochaine référence de client (CLI-2026-XXX, unique). */
const buildNextReference = () => {
  const max = getClientCache().reduce((current, client) => {
    const match = String(client.reference ?? '').match(/(\d{4})$/);
    if (!match) return current;
    const number = Number(match[1]);
    return number > current ? number : current;
  }, 0);
  const next = String(max + 1).padStart(4, '0');
  return `CLI-2026-${next}`;
};

export const partnerClientService = {
  /**
   * Liste des clients du partenaire (isolée multi-tenant), triée par statut
   * puis référence.
   * @returns {Promise<Array<object>>}
   */
  async getClients() {
    const clients = getClientCache()
      .filter(isInScope)
      .map(toPublicClient)
      .sort((a, b) => String(a.reference ?? '').localeCompare(String(b.reference ?? '')));
    return mockResponse(clients, { latency: 350 });
  },

  /**
   * Détail d'un client (404 hors portée / introuvable).
   * @param {string} id
   * @returns {Promise<object>}
   */
  async getClientById(id) {
    const client = getClientCache().find((item) => item.id === id && isInScope(item));
    if (!client) {
      return mockResponse(null, { error: ApiError.notFound('Client introuvable.') });
    }
    return mockResponse(toPublicClient(client), { latency: 300 });
  },

  /**
   * Recherche plein texte : nom, entreprise, email, téléphone, ville,
   * identifiant.
   * @param {string} query
   * @returns {Promise<Array<object>>}
   */
  async searchClients(query) {
    const needle = String(query ?? '').trim().toLowerCase();
    const clients = getClientCache()
      .filter(isInScope)
      .filter((client) => {
        if (!needle) return true;
        const haystack = [
          client.name,
          client.email,
          client.phone,
          client.city,
          client.reference,
          client.contactName,
          client.contact,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(needle);
      })
      .map(toPublicClient);
    return mockResponse(clients, { latency: 300 });
  },

  /**
   * Filtres combinés (statut, ville, type) appliqués côté service simulé.
   * @param {object} filters — { status, city, type }
   * @returns {Promise<Array<object>>}
   */
  async filterClients(filters = {}) {
    const { status = '', city = '', type = '' } = filters;
    const clients = getClientCache()
      .filter(isInScope)
      .filter((client) => {
        if (status && client.status !== status) return false;
        if (city && client.city !== city) return false;
        if (type && client.type !== type) return false;
        return true;
      })
      .map(toPublicClient);
    return mockResponse(clients, { latency: 300 });
  },

  /**
   * Statistiques du client : activité (missions) et finance FCFA —
   * informationnelle uniquement (aucun wallet / ledger / transaction).
   * @param {string} id
   * @returns {Promise<object>}
   */
  async getClientStats(id) {
    const client = getClientCache().find((item) => item.id === id && isInScope(item));
    if (!client) {
      return mockResponse(null, { error: ApiError.notFound('Client introuvable.') });
    }
    const summary = buildClientSummary(client);
    return mockResponse(
      {
        clientId: client.id,
        missionsCount: summary.missionsCount,
        inProgress: summary.inProgressMissions,
        completed: summary.completedMissions,
        scheduled: summary.scheduledMissions,
        cancelled: summary.cancelledMissions,
        revenue: summary.revenue,
        averagePerMission: summary.averagePerMission,
        lastMissionDate: summary.lastMissionDate,
        lastPaymentDate: summary.lastPaymentDate,
      },
      { latency: 300 },
    );
  },

  /**
   * Missions récentes du client — enregistrements réels du module Missions
   * (PROMPT 064), triés par date de début décroissante. Jamais dupliquées.
   * @param {string} id
   * @returns {Promise<Array<object>>}
   */
  async getClientMissions(id) {
    const client = getClientCache().find((item) => item.id === id && isInScope(item));
    if (!client) {
      return mockResponse(null, { error: ApiError.notFound('Client introuvable.') });
    }
    const missions = getLinkedMissions(client)
      .map((mission) => ({ ...mission }))
      .sort((a, b) => String(b.startDate ?? '').localeCompare(String(a.startDate ?? '')));
    return mockResponse(missions, { latency: 300 });
  },

  /**
   * Création d'un client. Le `companyId` et le `partnerId` sont TOUJOURS
   * appliqués côté service — jamais depuis l'UI. La référence est générée
   * automatiquement. Un client créé démarre actif.
   * @param {object} payload
   * @returns {Promise<object>}
   */
  async createClient(payload) {
    const now = new Date().toISOString();
    const client = {
      ...payload,
      id: `CLI-P-${String(Date.now()).slice(-5)}`,
      reference: buildNextReference(),
      companyId: PARTNER_COMPANY_ID,
      partnerId: PARTNER_PARTNER_ID,
      status: 'active',
      contact: payload.contactName || payload.name,
      missionClients: [],
      missionsCount: 0,
      completedMissions: 0,
      inProgressMissions: 0,
      revenue: 0,
      averagePerMission: 0,
      lastMissionDate: null,
      lastPaymentDate: null,
      createdAt: now,
      updatedAt: now,
    };
    getClientCache().unshift(client);
    return mockResponse(toPublicClient(client), { latency: 400 });
  },

  /**
   * Mise à jour d'un client (404 introuvable). Le statut n'est pas modifiable
   * ici : il évolue via l'archivage (archiveClient) ou une réactivation
   * métier dédiée — jamais de companyId/partnerId arbitraire.
   * @param {string} id
   * @param {object} payload
   * @returns {Promise<object>}
   */
  async updateClient(id, payload) {
    const index = getClientCache().findIndex((item) => item.id === id && isInScope(item));
    if (index === -1) {
      return mockResponse(null, { error: ApiError.notFound('Client introuvable.') });
    }
    const updated = {
      ...getClientCache()[index],
      ...payload,
      id,
      companyId: PARTNER_COMPANY_ID,
      partnerId: PARTNER_PARTNER_ID,
      contact: payload.contactName || getClientCache()[index].contact || payload.name,
      updatedAt: new Date().toISOString(),
    };
    getClientCache()[index] = updated;
    return mockResponse(toPublicClient(updated), { latency: 400 });
  },

  /**
   * Archivage d'un client — désactivation douce : les données sont conservées
   * (statut `archived`), jamais supprimées. 404 si hors portée.
   * @param {string} id
   * @returns {Promise<object>}
   */
  async archiveClient(id) {
    const index = getClientCache().findIndex((item) => item.id === id && isInScope(item));
    if (index === -1) {
      return mockResponse(null, { error: ApiError.notFound('Client introuvable.') });
    }
    const current = getClientCache()[index];
    if (current.status === 'archived') {
      return mockResponse(toPublicClient(current), { latency: 250 });
    }
    const updated = { ...current, status: 'archived', updatedAt: new Date().toISOString() };
    getClientCache()[index] = updated;
    return mockResponse(toPublicClient(updated), { latency: 350 });
  },
};
