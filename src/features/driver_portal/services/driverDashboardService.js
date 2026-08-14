/**
 * Navix Management — Driver Dashboard Service
 * --------------------------------------------------------------------------
 * Service encapsulant la logique d'accès aux données du Dashboard Chauffeur.
 * Simule des appels API avec les données mockées locales.
 */
import { DRIVER_MOCK_DATA } from '../mocks/driverDashboard.mock';

// Simulation de délai réseau
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const driverDashboardService = {
  /**
   * Récupère toutes les données du dashboard pour le chauffeur connecté.
   * Filtre potentiellement par chauffeur / tenant si c'était une vraie API.
   */
  async getDashboardData() {
    await delay(600); // 600ms network latency simulation

    // Dans une vraie API, on passerait l'ID du chauffeur ou on utiliserait le token.
    return {
      driver: DRIVER_MOCK_DATA.driver,
      metrics: DRIVER_MOCK_DATA.metrics,
      vehicle: DRIVER_MOCK_DATA.vehicle,
      nextTrip: DRIVER_MOCK_DATA.nextTrip,
      recentTrips: DRIVER_MOCK_DATA.recentTrips,
      activityEvolution: DRIVER_MOCK_DATA.activityEvolution,
      fuelData: DRIVER_MOCK_DATA.fuelData,
      alerts: DRIVER_MOCK_DATA.alerts,
      maintenances: DRIVER_MOCK_DATA.maintenances,
      documents: DRIVER_MOCK_DATA.documents,
      quickActions: DRIVER_MOCK_DATA.quickActions,
    };
  },

  /**
   * Signaler un incident (Mock)
   */
  async reportIncident(data) {
    await delay(800);
    console.log('Incident signalé :', data);
    return { success: true, message: 'Incident signalé avec succès.' };
  },

  /**
   * Démarrer un trajet (Mock)
   */
  async startTrip(tripId) {
    await delay(500);
    console.log('Trajet démarré :', tripId);
    return { success: true, message: 'Trajet démarré avec succès.' };
  },
};
