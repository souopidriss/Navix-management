/**
 * Navix Management — Driver Dashboard Service
 * --------------------------------------------------------------------------
 * Service encapsulant la logique d'accès aux données du Dashboard Chauffeur.
 * Simule des appels API avec les données mockées locales.
 *
 * Synchronisation workflow : les trajets « prochain / récents / en cours »
 * sont dérivés de l'état live des trajets (mêmes mocks que l'Espace Chauffeur)
 * afin que le dashboard reflète les mutations du workflow (démarrage, fin…).
 */
import { DRIVER_TRIPS_MOCK, DRIVER_VEHICLE_MOCK } from '../mocks/driverPortal.mock';
import { DRIVER_MOCK_DATA } from '../mocks/driverDashboard.mock';
import { selectDriverActiveTrip } from '../constants/driver.constants';
import { formatDate, formatNumber } from '@/utils/format';

// Simulation de délai réseau
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Durée (minutes) → « 3h20 », « 45 min », sinon « — ». */
const formatTripDuration = (minutes) => {
  if (!minutes || minutes <= 0) return '—';
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return hours > 0 ? `${hours}h${String(rest).padStart(2, '0')}` : `${rest} min`;
};

/** Mappe un trajet live vers la forme « prochain trajet » de la carte. */
const toNextTripCard = (trip) =>
  trip
    ? {
        id: trip.id,
        departure: trip.departure,
        destination: trip.arrival,
        date: formatDate(trip.departureDate),
        time: trip.departureTime,
        distance: `${formatNumber(trip.plannedDistance)} km`,
        status: trip.status,
      }
    : null;

/** Mappe un trajet live vers la forme « trajet récent » du tableau. */
const toRecentTripCard = (trip) => ({
  id: trip.id,
  date: formatDate(trip.departureDate),
  departure: trip.departure,
  destination: trip.arrival,
  distance: `${formatNumber(trip.plannedDistance)} km`,
  duration: formatTripDuration(trip.actualDuration),
  status: trip.status,
});

/** Normalise une alerte du mock vers le centre « Alertes & rappels » chauffeur. */
const toDriverAlert = (alert) => {
  const level = alert.severity === 'danger' ? 'urgent' : alert.severity === 'warning' ? 'attention' : 'info';
  let link = null;
  if (alert.type === 'Maintenance') link = '/driver/maintenance';
  else if (alert.type === 'Document') link = '/driver/documents';
  else if (alert.type === 'Trajet') link = '/driver/trips';
  return { id: alert.id, level, title: alert.title, description: alert.description, link };
};

export const driverDashboardService = {
  /**
   * Récupère toutes les données du dashboard pour le chauffeur connecté.
   * Filtre potentiellement par chauffeur / tenant si c'était une vraie API.
   */
  async getDashboardData() {
    await delay(600); // 600ms network latency simulation

    const trips = DRIVER_TRIPS_MOCK;
    const nextTrip = toNextTripCard(trips.find((trip) => trip.status === 'planned') ?? null);
    const activeTrip = selectDriverActiveTrip(trips);
    const recentTrips = trips
      .filter((trip) => trip.status === 'completed')
      .slice(0, 3)
      .map(toRecentTripCard);

    // Alertes métier dérivées de l'état live + rappels statiques du mock.
    const alerts = DRIVER_MOCK_DATA.alerts.map(toDriverAlert);
    if (activeTrip) {
      alerts.push({
        id: 'ALT-LIVE-TRIP',
        level: 'attention',
        title: `Trajet ${activeTrip.tripNumber} en cours`,
        description: 'Pensez à le clôturer à l\u2019arrivée et à signaler tout incident.',
        link: '/driver/trips',
      });
    }
    if (nextTrip) {
      alerts.push({
        id: 'ALT-LIVE-NEXT',
        level: 'info',
        title: `Prochain trajet ${nextTrip.id}`,
        description: `${nextTrip.departure} → ${nextTrip.destination}, le ${nextTrip.date} à ${nextTrip.time}.`,
        link: '/driver/trips',
      });
    }

    // KPIs « trajets du mois » / « kilomètres parcourus » dérivés de l'état
    // live des trajets pour rester cohérents avec la page « Mes trajets ».
    const nowDate = new Date();
    const currentMonth = `${nowDate.getFullYear()}-${String(nowDate.getMonth() + 1).padStart(2, '0')}`;
    const monthTrips = trips.filter(
      (trip) => trip.status !== 'cancelled' && (trip.departureDate || '').slice(0, 7) === currentMonth,
    );
    const tripsMonth = monthTrips.length;
    const distanceMonth = `${formatNumber(
      monthTrips.reduce((sum, trip) => sum + (Number(trip.actualDistance) || 0), 0),
    )} km`;

    const metrics = DRIVER_MOCK_DATA.metrics.map((metric) => {
      if (metric.key === 'trips_month') return { ...metric, value: tripsMonth };
      if (metric.key === 'distance_month') return { ...metric, value: distanceMonth };
      return metric;
    });

    // Dans une vraie API, on passerait l'ID du chauffeur ou on utiliserait le token.
    return {
      driver: DRIVER_MOCK_DATA.driver,
      metrics,
      vehicle: DRIVER_VEHICLE_MOCK,
      nextTrip,
      activeTrip,
      recentTrips,
      activityEvolution: DRIVER_MOCK_DATA.activityEvolution,
      fuelData: DRIVER_MOCK_DATA.fuelData,
      alerts,
      maintenances: DRIVER_MOCK_DATA.maintenances,
      documents: DRIVER_MOCK_DATA.documents,
      quickActions: DRIVER_MOCK_DATA.quickActions,
    };
  },

  /**
   * Signaler un incident (Mock)
   */
  async reportIncident(_data) {
    await delay(800);
    return { success: true, message: 'Incident signalé avec succès.' };
  },

  /**
   * Démarrer un trajet (Mock)
   */
  async startTrip(_tripId) {
    await delay(500);
    return { success: true, message: 'Trajet démarré avec succès.' };
  },
};
