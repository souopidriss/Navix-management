/**
 * Navix Notifications — NotificationIntegrationService
 * --------------------------------------------------------------------------
 * Préparation de l'intégration avec le journal des actions (Audit). 100 %
 * simulé : aucune écriture backend. Les actions importantes du centre de
 * notifications (suppression, archivage, modification des préférences)
 * sont préparées pour être enregistrées dans les Audit Logs.
 *
 * Appel isolé (try/catch) : une défaillance d'intégration ne doit jamais
 * faire échouer l'opération de notification en cours.
 */
import { useAuthStore } from '@/features/auth';
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

const AUDIT_META = {
  DELETE: { label: 'Suppression', severity: 'medium' },
  ARCHIVE: { label: 'Archivage', severity: 'low' },
  UPDATE: { label: 'Modification', severity: 'low' },
  MARK_READ: { label: 'Marquage lu', severity: 'low' },
};

/**
 * Préfixe le journal des actions simulé d'une entrée d'audit concernant une
 * notification (ou un lot).
 * @param {object} payload — { action, ids, titles, description?, severity? }
 */
export const emitNotificationAuditLog = ({
  action,
  ids,
  titles,
  description,
  severity,
}) => {
  try {
    const actor = getActor();
    const meta = AUDIT_META[action] ?? { label: action, severity: 'low' };
    const resourceLabel =
      Array.isArray(titles) && titles.length > 0
        ? titles[0]
        : titles || 'Notification';
    const count = Array.isArray(ids) ? ids.length : 1;

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
      resourceType: 'notification',
      resourceId: Array.isArray(ids) ? ids.join(',') : ids,
      resourceName: resourceLabel,
      description:
        description ||
        `${meta.label} de notification${count > 1 ? `s (${count})` : ''} : ${resourceLabel}`,
      status: 'success',
      severity: severity || meta.severity,
      ipAddress: '102.164.25.10',
      userAgent: 'Navix Management (mock)',
      createdAt: new Date().toISOString(),
      metadata: { source: 'notifications', action, count },
    });
  } catch {
    /* Simulation uniquement — ne jamais bloquer l'opération courante. */
  }
};

/**
 * Alias sémantique : entrée d'audit pour une modification de préférences.
 * @param {object} payload — { oldValues?, newValues?, description? }
 */
export const emitNotificationPreferencesAuditLog = ({
  oldValues,
  newValues,
  description = 'Modification des préférences de notification.',
}) => {
  try {
    emitNotificationAuditLog({
      action: 'UPDATE',
      ids: null,
      titles: 'Préférences de notification',
      description,
      severity: 'low',
    });
    const entry = MOCK_AUDIT_LOGS[0];
    if (entry) {
      if (oldValues) entry.oldValues = oldValues;
      if (newValues) entry.newValues = newValues;
      entry.metadata = { ...entry.metadata, source: 'notifications.preferences' };
    }
  } catch {
    /* Simulation uniquement. */
  }
};
