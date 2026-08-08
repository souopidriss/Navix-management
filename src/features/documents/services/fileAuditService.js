/**
 * Navix Documents — FileAuditService
 * --------------------------------------------------------------------------
 * Préparation de l'intégration avec le journal des actions (Audit). 100 %
 * simulé : aucune écriture backend. Les actions du centre de documents
 * (téléversement, téléchargement, création, modification, suppression,
 * gestion des types de fichiers) sont enregistrées dans les Audit Logs
 * préfixés (MOCK_AUDIT_LOGS), sur le même modèle que le module
 * Notifications (`emitNotificationAuditLog`).
 *
 * Appel isolé (try/catch) : une défaillance d'intégration ne doit jamais
 * faire échouer l'opération de document en cours.
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
    userId: user?.id ?? 'usr_demo',
    userName: user?.name ?? 'Utilisateur',
    companyId: company?.id ?? 'cmp_demo',
    companyName: company?.name ?? '',
  };
};

const FILE_AUDIT_META = {
  UPLOAD: { label: 'Téléversement', severity: 'low' },
  DOWNLOAD: { label: 'Téléchargement', severity: 'low' },
  CREATE: { label: 'Création', severity: 'low' },
  UPDATE: { label: 'Modification', severity: 'low' },
  DELETE: { label: 'Suppression', severity: 'medium' },
  FILE_TYPE_CREATE: { label: 'Création de type', severity: 'low' },
  FILE_TYPE_UPDATE: { label: 'Modification de type', severity: 'low' },
  FILE_TYPE_DELETE: { label: 'Suppression de type', severity: 'medium' },
};

/**
 * Préfixe le journal des actions simulé d'une entrée d'audit concernant un
 * document (ou un lot).
 * @param {object} payload — { action, ids, titles, description?, severity? }
 */
export const emitFileAuditLog = ({
  action,
  ids,
  titles,
  description,
  severity,
}) => {
  try {
    const actor = getActor();
    const meta = FILE_AUDIT_META[action] ?? { label: action, severity: 'low' };
    const resourceLabel =
      Array.isArray(titles) && titles.length > 0
        ? titles[0]
        : titles || 'Document';
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
      resourceType: 'document',
      resourceId: Array.isArray(ids) ? ids.join(',') : ids,
      resourceName: resourceLabel,
      description:
        description ||
        `${meta.label} de document${count > 1 ? `s (${count})` : ''} : ${resourceLabel}`,
      status: 'success',
      severity: severity || meta.severity,
      ipAddress: '102.164.25.10',
      userAgent: 'Navix Management (mock)',
      createdAt: new Date().toISOString(),
      metadata: { source: 'documents', action, count },
    });
  } catch {
    /* Simulation uniquement — ne jamais bloquer l'opération courante. */
  }
};
