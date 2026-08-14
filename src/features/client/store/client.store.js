/**
 * Navix Client — Store Zustand du module Espace Client
 * --------------------------------------------------------------------------
 * Gestion de l'état local du client (clientType: enterprise vs individual,
 * profil client courant, dashboard client, chargement et erreurs).
 */
import { create } from 'zustand';
import { CLIENT_TYPES } from '../constants/client.constants';
import { clientService } from '../services/clientService';

const initialState = {
  clientType: CLIENT_TYPES.ENTERPRISE,
  currentClient: null,
  dashboardData: null,
  isLoading: false,
  error: null,
};

export const useClientStore = create((set, get) => ({
  ...initialState,

  /** Bascule entre Client Entreprise et Client Particulier. */
  setClientType: (type) => {
    set({ clientType: type });
    get().fetchDashboard();
  },

  /** Charge les données du Dashboard Client. */
  fetchDashboard: async () => {
    const { clientType } = get();
    set({ isLoading: true, error: null });

    try {
      const data = await clientService.getClientDashboard(clientType);
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
