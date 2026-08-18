/**
 * Navix Partner Portal — Store Zustand du module Espace Partenaire
 * --------------------------------------------------------------------------
 * Gestion de l'état local du partenaire (profil entreprise partenaire,
 * contexte multi-tenant, dashboard partenaire, chargement et erreurs).
 * N'initialise pas le rôle : celui-ci provient de la session (auth.store)
 * et du store RBAC. Le rôle `partner` est le seul habilité sur /partner/*.
 */
import { create } from 'zustand';
import { partnerPortalService } from '../services/partnerPortalService';

const initialState = {
  currentPartner: null,
  companyContext: null,
  dashboardData: null,
  isLoading: false,
  error: null,
};

export const usePartnerStore = create((set) => ({
  ...initialState,

  /**
   * Charge le contexte entreprise / multi-tenant du Partenaire
   * (session + profil mock). Vue de lecture dérivée uniquement.
   */
  fetchContext: async () => {
    try {
      const companyContext = await partnerPortalService.getPartnerContext();
      set({ companyContext });
    } catch {
      set({ companyContext: null });
    }
  },

  /** Charge les données du Dashboard Partenaire. */
  fetchDashboard: async () => {
    set({ isLoading: true, error: null });

    try {
      const data = await partnerPortalService.getPartnerDashboard();
      set({
        currentPartner: data.partner,
        dashboardData: data,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      set({
        isLoading: false,
        error: err?.message || 'Impossible de charger les données partenaire.',
      });
    }
  },

  /** Réinitialise le store Partenaire. */
  reset: () => set({ ...initialState }),
}));
