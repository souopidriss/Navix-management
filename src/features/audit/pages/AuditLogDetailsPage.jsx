/**
 * Navix Audit — AuditLogDetailsPage
 * --------------------------------------------------------------------------
 * Détail d'une entrée du journal des actions (lecture seule, immuable) :
 * badges (action, famille, ressource, statut, sévérité), description,
 * ressource liée (navigation générique), acteur, contexte réseau, résultat,
 * métadonnées et modifications avant/après. Rechargée depuis le store pour
 * rester cohérente avec la liste.
 */
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Alert, Button } from '@/components/ui';
import { PageContainer, PageHeader, LoadingState } from '@/components/core';
import { ROUTES } from '@/routes/route.constants';
import { useAuditStore } from '../store';
import { useAuditActions, useAuditPermissions } from '../hooks';
import { AuditLogDetails } from '../components';
import { AUDIT_ICON, getAuditResourcePath } from '../constants';

const AuditLogDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const selectedLog = useAuditStore((state) => state.selectedLog);
  const isLoading = useAuditStore((state) => state.isLoading);
  const error = useAuditStore((state) => state.error);
  const fetchLog = useAuditStore((state) => state.fetchLog);
  const clearError = useAuditStore((state) => state.clearError);

  const { actions } = useAuditActions();
  const { canViewSensitive } = useAuditPermissions();

  useEffect(() => {
    if (id) fetchLog(id);
  }, [id, fetchLog]);

  const log = selectedLog?.id === id ? selectedLog : null;

  const handleOpenResource = () => {
    if (!log) return;
    const path = getAuditResourcePath(log.resourceType, log.resourceId);
    if (path !== '/') navigate(path);
  };

  if (!log) {
    return (
      <PageContainer>
        <Helmet>
          <title>Entrée du journal — Navix Management</title>
        </Helmet>
        {isLoading ? (
          <LoadingState variant="text" lines={6} label="Chargement de l'entrée du journal…" />
        ) : (
          <Alert variant="danger" closable onClose={clearError} className="mb-3">
            {error || 'Entrée du journal introuvable.'}
          </Alert>
        )}
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Helmet>
        <title>{`${log.action} — ${log.resourceName} — Navix Management`}</title>
      </Helmet>

      <PageHeader
        title="Détail de l'action"
        subtitle={`${log.userName} — ${log.description}`}
        icon={AUDIT_ICON}
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Journal des actions', to: ROUTES.AUDIT_LOGS },
          { label: log.description },
        ]}
        actions={
          <div className="d-flex gap-2">
            <Button variant="outline" size="sm" icon="bi-arrow-counterclockwise" loading={isLoading} onClick={actions.refresh}>
              Rafraîchir
            </Button>
            <Button variant="outline" size="sm" icon="bi-arrow-left" onClick={() => navigate(ROUTES.AUDIT_LOGS)}>
              Retour à la liste
            </Button>
          </div>
        }
      />

      {error && (
        <Alert variant="danger" closable onClose={clearError} className="mb-3">
          {error}
        </Alert>
      )}

      <AuditLogDetails log={log} onOpenResource={handleOpenResource} canViewSensitive={canViewSensitive} />
    </PageContainer>
  );
};

export default AuditLogDetailsPage;
