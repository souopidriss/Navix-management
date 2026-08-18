/**
 * Navix Client — Store Zustand du module Espace Client
 * --------------------------------------------------------------------------
 * Gestion de l'état local du client (clientType: enterprise vs individual,
 * profil client courant, dashboard client, chargement et erreurs).
 */
import { create } from 'zustand';
import { CLIENT_TYPES } from '../constants/client.constants';
import { clientPortalService } from '../services/clientPortalService';

const initialState = {
  clientType: CLIENT_TYPES.ENTERPRISE,
  currentClient: null,
  companyContext: null,
  dashboardData: null,
  isLoading: false,
  error: null,
};

export const useClientStore = create((set, get) => ({
  ...initialState,

  /** Bascule entre Client Entreprise et Client Particulier. */
  setClientType: (type) => {
    set({ clientType: type });
    get().fetchContext();
    get().fetchDashboard();
  },

  /**
   * Charge le contexte entreprise / multi-tenant du Client (session + profil).
   * Ne duplique pas auth.store : seule la vue de lecture est dérivée ici.
   */
  fetchContext: async () => {
    const { clientType } = get();

    try {
      const companyContext = await clientPortalService.getClientContext(clientType);
      set({ companyContext });
    } catch {
      set({ companyContext: null });
    }
  },

  /** Charge les données du Dashboard Client. */
  fetchDashboard: async () => {
    const { clientType } = get();
    set({ isLoading: true, error: null });

    try {
      const data = await clientPortalService.getClientDashboard(clientType);
      set({
        currentClient: data.client,
        dashboardData: data,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      set({
        isLoading: false,
        error: err?.message || 'Impossible de charger les données client.',
      });
    }
  },

  /** Réinitialise le store Client. */
  reset: () => set({ ...initialState }),
}));
