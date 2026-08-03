/**
 * Navix NotificationService
 * --------------------------------------------------------------------------
 * Description : notifications de l'utilisateur connecté.
 * Responsabilité : fournir la liste des notifications et le compteur de non-lues
 *                  aux vues. Mode mock : données simulées, aucune requête HTTP.
 *
 * Exemple d'utilisation :
 *   import { notificationService } from '@/services/api';
 *   const { count } = await notificationService.getUnreadCount();
 */
import { API_ENDPOINTS } from '@/config';
import { apiClient } from '../client';
import { apiConfig } from '../config';
import { mockResponse } from '../utils';

const MOCK_NOTIFICATIONS = [
  { id: 'ntf_001', type: 'maintenance', title: 'Entretien à prévoir', message: 'Le véhicule AB-123-CD approche de son échéance.', read: false, createdAt: '2026-07-28T08:30:00Z' },
  { id: 'ntf_002', type: 'fuel', title: 'Plein de carburant validé', message: '45 L ajoutés sur le véhicule AB-123-CD.', read: false, createdAt: '2026-07-28T07:15:00Z' },
  { id: 'ntf_003', type: 'invoice', title: 'Facture à régler', message: 'La facture FAC-2026-0143 arrive à échéance.', read: true, createdAt: '2026-07-24T09:00:00Z' },
];

export const notificationService = {
  /**
   * Liste des notifications.
   * @param {{ page?: number, limit?: number }} [params]
   * @returns {Promise<Array<object>>}
   */
  async getNotifications(params = {}) {
    if (apiConfig.mock) {
      return mockResponse(MOCK_NOTIFICATIONS);
    }

    const { data } = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS.LIST, { params });
    return data;
  },

  /**
   * Nombre de notifications non lues.
   * @returns {Promise<{ count: number }>}
   */
  async getUnreadCount() {
    if (apiConfig.mock) {
      return mockResponse({ count: MOCK_NOTIFICATIONS.filter((notification) => !notification.read).length });
    }

    const { data } = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
    return data;
  },
};
