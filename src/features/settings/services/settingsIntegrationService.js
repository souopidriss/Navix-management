/**
 * Navix Settings — SettingsIntegrationService
 * --------------------------------------------------------------------------
 * Préparation de l'intégration avec le système de Notifications et le
 * journal des actions (Audit). 100 % simulé : aucune écriture backend.
 *
 *   - emitSettingsNotification() : injecte une notification entrante dans le
 *     centre de notifications (realtime simulé) puis rafraîchit le store.
 *   - emitSettingsAuditLog()     : préfixe le journal des actions simulé
 *     d'une entrée (les changements sensibles génèrent une entrée d'audit).
 *
 * Les deux appels sont isolés (try/catch) : une défaillance d'intégration ne
 * doit jamais faire échouer la sauvegarde des paramètres.
 */
import { useAuthStore } from '@/features/auth';
import { notificationRealtimeService, useNotificationsStore } from '@/features/notifications';
import { MOCK_AUDIT_LOGS } from '@/features/audit/mocks';

const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

/** Génère un identifiant ULID plausible (horodatage + aléa Crockford). */
const generateUlid = () => {
  const time = Date.now().toString(36).toUpperCase().padStart(10, '0').slice(0, 10);
  let random = '';
  for (let i = 0; i < 16; i += 1) {
    random += CROCKFORD[Math.floor(Math.random() * CROCKFORD.length)];
  }
  return `${time}${random}`;
};

/** Acteur courant (utilisateur + entreprise connectés). */
const getActor = () => {
  const { user, company } = useAuthStore.getState();
  return {
    userId: user?.id ?? 'usr_001',
    userName: user?.name ?? 'Utilisateur',
    companyId: company?.id ?? 'cmp_demo',
    companyName: company?.name ?? '',
  };
};

/**
 * Injecte une notification simulée dans le centre de notifications.
 * @param {object} payload — { section, title, message }
 */
export const emitSettingsNotification = ({ section, title, message }) => {
  try {
    const { userId, companyId } = getActor();
    const createdAt = new Date().toISOString();
    const notification = {
      id: generateUlid(),
      companyId,
      userId,
      kind: 'settings_updated',
      type: 'system',
      category: 'info',
      severity: 'low',
      title,
      message,
      status: 'unread',
      isRead: false,
      readAt: null,
      resourceType: 'settings',
      resourceId: section,
      createdAt,
      expiresAt: null,
      metadata: { section, source: 'settings' },
    };

    notificationRealtimeService.simulateIncomingNotification(notification);
    const store = useNotificationsStore.getState();
    store.fetchNotifications?.();
    store.fetchUnreadCount?.();
  } catch {
    /* Simulation uniquement — ne jamais bloquer la sauvegarde. */
  }
};

/**
 * Préfixe le journal des actions simulé d'une entrée d'audit.
 * @param {object} payload — { section, sectionLabel, description,
 *                            action?, severity?, oldValues?, newValues? }
 */
export const emitSettingsAuditLog = ({
  section,
  sectionLabel,
  description,
  action = 'UPDATE',
  severity = 'medium',
  oldValues,
  newValues,
}) => {
  try {
    const actor = getActor();
    MOCK_AUDIT_LOGS.unshift({
      id: generateUlid(),
      companyId: actor.companyId,
      companyName: actor.companyName,
      agencyId: null,
      agencyName: null,
      userId: actor.userId,
      userName: actor.userName,
      action,
      actionType: 'crud',
      resourceType: 'settings',
      resourceId: section,
      resourceName: sectionLabel,
      description,
      status: 'success',
      severity,
      ipAddress: '102.164.25.10',
      userAgent: 'Navix Management (mock)',
      createdAt: new Date().toISOString(),
      metadata: { section, source: 'settings' },
      ...(oldValues ? { oldValues } : {}),
      ...(newValues ? { newValues } : {}),
    });
  } catch {
    /* Simulation uniquement — ne jamais bloquer la sauvegarde. */
  }
};
