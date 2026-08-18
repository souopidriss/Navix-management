/**
 * Navix Partner Portal — Service Missions Partenaire (PROMPT 064)
 * --------------------------------------------------------------------------
 * Gestion complète des missions de l'entreprise partenaire, strictement
 * isolée multi-tenant : le Partenaire ne voit que les missions liées à
 * `companyId` = `PARTNER_COMPANY_ID` (cmp_partner_navix). Le `companyId` est
 * toujours appliqué côté service simulé — jamais depuis l'UI.
 *
 * Règles métier (graphe de transitions) :
 *   scheduled    → in_progress, cancelled
 *   in_progress  → completed, cancelled
 *   completed    → (aucun)
 *   cancelled    → (aucun)
 *
 * Périodes de filtre : Aujourd'hui / Cette semaine / Ce mois / Ce trimestre /
 * Personnalisée (plage de dates explicite). Monnaie : FCFA (XAF) uniquement.
 * Les mutations vivent dans un cache local (copie du mock) : les autres
 * services (portail, dashboard) passent par ce cache après mutation pour
 * garantir une source unique de vérité.
 */
import { mockResponse } from '@/services/utils';
import { ApiError } from '@/services/errors';
import { MOCK_PARTNER_MISSIONS } from '../mocks/partner.mock';
import { PARTNER_COMPANY_ID, PARTNER_PARTNER_ID, getNextPartnerMissionStatuses } from '../constants/partner.constants';

let missionCache = null;

const getMissionCache = () => {
  if (!missionCache) {
    missionCache = MOCK_PARTNER_MISSIONS.map((mission) => ({ ...mission }));
  }
  return missionCache;
};

/** Getter public du cache missions (lecture pour agrégations, copie défensive). */
export const getPartnerMissionsCache = () => getMissionCache().map((mission) => ({ ...mission }));

const isInScope = (mission) => mission.companyId === PARTNER_COMPANY_ID && (!mission.partnerId || mission.partnerId === PARTNER_PARTNER_ID);

const toPublicMission = (mission) => ({ ...mission });

const toIsoDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/** Bornes de la plage [start, end] de la période courante (format YYYY-MM-DD). */
const getPeriodRange = (period, custom = {}) => {
  if (period === 'custom') {
    const from = custom.from || '';
    const to = custom.to || '';
    if (!from && !to) return null;
    return { start: from, end: to };
  }

  const now = new Date();

  if (period === 'today') {
    const today = toIsoDate(now);
    return { start: today, end: today };
  }

  if (period === 'week') {
    const day = now.getDay(); // 0 = dimanche
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return { start: toIsoDate(monday), end: toIsoDate(sunday) };
  }

  if (period === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { start: toIsoDate(start), end: toIsoDate(end) };
  }

  if (period === 'quarter') {
    const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
    const start = new Date(now.getFullYear(), quarterStartMonth, 1);
    const end = new Date(now.getFullYear(), quarterStartMonth + 3, 0);
    return { start: toIsoDate(start), end: toIsoDate(end) };
  }

  return null;
};

/** Chevauchement entre la période de la mission et la plage donnée. */
const missionOverlapsRange = (mission, range) => {
  if (!range || !range.start || !range.end) return true;
  return mission.endDate >= range.start && mission.startDate <= range.end;
};

/**
 * Détermine si une mission appartient à la période donnée (réutilisée par le
 * hook usePartnerMissions pour le filtrage côté page).
 * @param {object} mission
 * @param {string} period — 'today' | 'week' | 'month' | 'quarter' | 'custom'
 * @param {object} [custom] — { from, to } pour la période personnalisée
 * @returns {boolean}
 */
export const isMissionInPeriod = (mission, period, custom = {}) =>
  missionOverlapsRange(mission, getPeriodRange(period, custom));

/** Génère la prochaine référence de mission (MIS-2026-08XX, unique). */
const buildNextReference = () => {
  const max = getMissionCache().reduce((current, mission) => {
    const match = String(mission.reference ?? '').match(/(\d{4})$/);
    if (!match) return current;
    const number = Number(match[1]);
    return number > current ? number : current;
  }, 0);
  const yearMonth = '2026-08';
  const next = String(max + 1).padStart(4, '0');
  return `MIS-${yearMonth}-${next}`;
};

export const partnerMissionService = {
  /**
   * Liste des missions du partenaire (isolée multi-tenant), triée par date de
   * début décroissante.
   * @returns {Promise<Array<object>>}
   */
  async getMissions() {
    const missions = getMissionCache()
      .filter(isInScope)
      .map(toPublicMission)
      .sort((a, b) => String(b.startDate ?? '').localeCompare(String(a.startDate ?? '')));
    return mockResponse(missions, { latency: 350 });
  },

  /**
   * Détail d'une mission (404 hors portée / introuvable).
   * @param {string} id
   * @returns {Promise<object>}
   */
  async getMissionById(id) {
    const mission = getMissionCache().find((item) => item.id === id && isInScope(item));
    if (!mission) {
      return mockResponse(null, { error: ApiError.notFound('Mission introuvable.') });
    }
    return mockResponse(toPublicMission(mission), { latency: 300 });
  },

  /**
   * Recherche plein texte : référence, titre, client, véhicule, chauffeur,
   * départ, destination.
   * @param {string} query
   * @returns {Promise<Array<object>>}
   */
  async searchMissions(query) {
    const needle = String(query ?? '').trim().toLowerCase();
    const missions = getMissionCache()
      .filter(isInScope)
      .filter((mission) => {
        if (!needle) return true;
        const haystack = [
          mission.reference,
          mission.title,
          mission.client,
          mission.vehicle,
          mission.vehicleModel,
          mission.registrationNumber,
          mission.driver,
          mission.departure,
          mission.destination,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(needle);
      });
    return mockResponse(missions, { latency: 300 });
  },

  /**
   * Filtres combinés (statut, type, période) appliqués côté service simulé.
   * @param {object} filters — { status, type, period, customFrom, customTo }
   * @returns {Promise<Array<object>>}
   */
  async filterMissions(filters = {}) {
    const { status = '', type = '', period = '' } = filters;
    const range = period ? getPeriodRange(period, { from: filters.customFrom, to: filters.customTo }) : null;
    const missions = getMissionCache()
      .filter(isInScope)
      .filter((mission) => {
        if (status && mission.status !== status) return false;
        if (type && mission.type !== type) return false;
        if (period && !missionOverlapsRange(mission, range)) return false;
        return true;
      });
    return mockResponse(missions, { latency: 300 });
  },

  /**
   * Statistiques des missions : total, répartition par statut et revenus des
   * missions terminées (FCFA).
   * @returns {Promise<object>}
   */
  async getMissionStats() {
    const missions = getMissionCache().filter(isInScope);
    const stats = missions.reduce(
      (acc, mission) => {
        acc.total += 1;
        acc[mission.status] = (acc[mission.status] ?? 0) + 1;
        if (mission.status === 'completed') acc.revenue += Number(mission.amount) || 0;
        return acc;
      },
      { total: 0, scheduled: 0, in_progress: 0, completed: 0, cancelled: 0, revenue: 0 },
    );
    return mockResponse(stats, { latency: 300 });
  },

  /**
   * Création d'une mission. Le `companyId` du partenaire est toujours appliqué
   * côté service — jamais depuis l'UI. La référence est générée automatiquement.
   * @param {object} payload
   * @returns {Promise<object>}
   */
  async createMission(payload) {
    const now = new Date().toISOString();
    const mission = {
      ...payload,
      companyId: PARTNER_COMPANY_ID,
      reference: payload.reference || buildNextReference(),
      id: `MIS-P-${String(Date.now()).slice(-5)}`,
      vehicle: payload.vehicle || `${payload.vehicleBrand ?? ''} ${payload.vehicleModel ?? ''}`.trim(),
      createdAt: now,
      updatedAt: now,
    };
    getMissionCache().unshift(mission);
    return mockResponse(toPublicMission(mission), { latency: 400 });
  },

  /**
   * Mise à jour d'une mission (404 introuvable).
   * @param {string} id
   * @param {object} payload
   * @returns {Promise<object>}
   */
  async updateMission(id, payload) {
    const index = getMissionCache().findIndex((item) => item.id === id && isInScope(item));
    if (index === -1) {
      return mockResponse(null, { error: ApiError.notFound('Mission introuvable.') });
    }
    const updated = {
      ...getMissionCache()[index],
      ...payload,
      id,
      companyId: PARTNER_COMPANY_ID,
      vehicle: payload.vehicle || `${payload.vehicleBrand ?? ''} ${payload.vehicleModel ?? ''}`.trim(),
      updatedAt: new Date().toISOString(),
    };
    getMissionCache()[index] = updated;
    return mockResponse(toPublicMission(updated), { latency: 400 });
  },

  /**
   * Changement de statut (transitions métier validées, 409 sinon).
   * @param {string} id
   * @param {string} nextStatus
   * @returns {Promise<object>}
   */
  async updateMissionStatus(id, nextStatus) {
    const index = getMissionCache().findIndex((item) => item.id === id && isInScope(item));
    if (index === -1) {
      return mockResponse(null, { error: ApiError.notFound('Mission introuvable.') });
    }
    const current = getMissionCache()[index];
    if (!getNextPartnerMissionStatuses(current.status).includes(nextStatus)) {
      return mockResponse(null, {
        error: new ApiError({
          status: 409,
          code: 'MISSION_STATUS_TRANSITION',
          message: 'Transition de statut non autorisée pour cette mission.',
        }),
      });
    }
    const updated = { ...current, status: nextStatus, updatedAt: new Date().toISOString() };
    getMissionCache()[index] = updated;
    return mockResponse(toPublicMission(updated), { latency: 350 });
  },

  /**
   * Annulation d'une mission planifiée ou en cours (404/409 sinon).
   * @param {string} id
   * @returns {Promise<object>}
   */
  async cancelMission(id) {
    return this.updateMissionStatus(id, 'cancelled');
  },

  /**
   * Suppression définitive d'une mission (404 introuvable).
   * @param {string} id
   * @returns {Promise<{ id: string }>}
   */
  async deleteMission(id) {
    const index = getMissionCache().findIndex((item) => item.id === id && isInScope(item));
    if (index === -1) {
      return mockResponse(null, { error: ApiError.notFound('Mission introuvable.') });
    }
    const [removed] = getMissionCache().splice(index, 1);
    return mockResponse({ id: removed.id }, { latency: 350 });
  },
};
