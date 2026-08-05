/**
 * Navix Notifications — NotificationRealtimeService
 * --------------------------------------------------------------------------
 * Description : abstraction de connexion temps réel. En mode mock elle
 * simule le cycle de vie d'un canal temps réel (connexion, souscriptions,
 * événements entrants) SANS WebSocket / SSE / Socket.IO.
 *
 * Dans l'architecture cible, ce service sera branché sur le backend
 * Express.js (WebSocket/SSE) : il recevra les événements du serveur et les
 * poussera vers le store Zustand qui mettra à jour l'interface. Aujourd'hui,
 * il s'agit exclusivement d'un contrat d'interface + simulation locale.
 *
 * API :
 *   connect()                          → Promise<void> — ouvre le canal
 *   disconnect()                       → Promise<void> — ferme le canal
 *   subscribe(channel, handler)        → () => void    — s'abonne (returns unsubscribe)
 *   unsubscribe(channel, handler)      → void
 *   onNotification(handler)            → () => void    — notification reçue
 *   onAlert(handler)                   → () => void    — alerte critique reçue
 *   simulateIncomingNotification(notification) → void  — pousse un événement (démo)
 *   isConnected()                      → boolean
 */
import { alertService } from './alertService';
import { getNotificationsCache } from './notificationService';

const NOTIFICATION_CHANNEL = 'notifications';
const ALERT_CHANNEL = 'alerts';

/** Événement simulé de notification entrante (démo / plus tard serveur). */
const demoEvent = () => ({
  type: 'notification.created',
  payload: { ts: new Date().toISOString(), source: 'simulation' },
});

class NotificationRealtimeService {
  constructor() {
    this.connected = false;
    this.listeners = new Map(); // channel → Set<handler>
    this.connectTimer = null;
  }

  /** @returns {boolean} — canal ouvert ? */
  isConnected() {
    return this.connected;
  }

  /**
   * Ouvre le canal temps réel (simulé). Résout après un court délai ; émet
   * un événement de démo une fois connecté.
   * @returns {Promise<void>}
   */
  async connect() {
    if (this.connected) return;
    this.connected = true;
    this.emit('connection', { connected: true, transport: 'mock' });
    this.connectTimer = setTimeout(() => this.emit(NOTIFICATION_CHANNEL, demoEvent()), 1500);
  }

  /**
   * Ferme le canal temps réel (simulé).
   * @returns {Promise<void>}
   */
  async disconnect() {
    if (this.connectTimer) clearTimeout(this.connectTimer);
    this.connectTimer = null;
    this.connected = false;
    this.emit('connection', { connected: false });
  }

  /**
   * S'abonne à un canal.
   * @param {string} channel
   * @param {(event: object) => void} handler
   * @returns {() => void} — fonction de désabonnement
   */
  subscribe(channel, handler) {
    if (typeof handler !== 'function') return () => {};
    const set = this.listeners.get(channel) || new Set();
    set.add(handler);
    this.listeners.set(channel, set);
    return () => this.unsubscribe(channel, handler);
  }

  /**
   * Se désabonne d'un canal.
   * @param {string} channel
   * @param {(event: object) => void} handler
   */
  unsubscribe(channel, handler) {
    const set = this.listeners.get(channel);
    if (!set) return;
    set.delete(handler);
    if (set.size === 0) this.listeners.delete(channel);
  }

  /**
   * Notifie tous les abonnés d'un canal.
   * @param {string} channel
   * @param {object} event
   */
  emit(channel, event) {
    this.listeners.get(channel)?.forEach((handler) => {
      try {
        handler(event);
      } catch (error) {
        console.error('NotificationRealtimeService.emit', error);
      }
    });
  }

  /**
   * Abonnement aux notifications entrantes.
   * @param {(notification: object) => void} handler
   * @returns {() => void}
   */
  onNotification(handler) {
    return this.subscribe(NOTIFICATION_CHANNEL, handler);
  }

  /**
   * Abonnement aux alertes critiques entrantes.
   * @param {(alert: object) => void} handler
   * @returns {() => void}
   */
  onAlert(handler) {
    return this.subscribe(ALERT_CHANNEL, handler);
  }

  /**
   * Pousse une notification entrante (démo / plus tard serveur). Marque le
   * cache du NotificationService et émet l'événement.
   * @param {object} [notification] — notification métier à injecter
   * @returns {object|null}         — notification injectée (ou null si démo)
   */
  simulateIncomingNotification(notification) {
    if (notification && notification.id) {
      const cache = getNotificationsCache();
      cache.unshift({ ...notification });
      this.emit(NOTIFICATION_CHANNEL, { type: 'notification.created', payload: notification });
      return notification;
    }

    this.emit(NOTIFICATION_CHANNEL, demoEvent());
    return null;
  }

  /**
   * Génère et émet une alerte automatique (via AlertService), puis la signale
   * sur le canal des alertes critiques.
   * @returns {Promise<object|null>} — alerte générée (ou null)
   */
  async simulateIncomingAlert() {
    const [alert] = await alertService.generateAlerts();
    if (!alert) return null;
    this.emit(ALERT_CHANNEL, { type: 'alert.created', payload: alert });
    return alert;
  }
}

/** Instance unique partagée par toute l'application. */
export const notificationRealtimeService = new NotificationRealtimeService();
