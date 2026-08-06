/**
 * Navix Audit — AuditLogDetails
 * --------------------------------------------------------------------------
 * Détail complet et en lecture seule d'une entrée du journal : description,
 * identification, acteur, contexte réseau, résultat, métadonnées et
 * modifications (avant → après). Un lien ouvre la fiche de la ressource
 * liée lorsque celle-ci existe. Rien n'est modifiable — le journal est
 * immuable.
 *
 * Props :
 *   log     : entrée du journal
 *   onOpenResource : (log) => void — lien vers la ressource liée
 */
import { Button, Card } from '@/components/ui';
import {
  formatAuditDateTime,
  formatAuditValue,
  getUser,
  getAuditAction,
  getAuditActionType,
  getAuditResource,
  getAuditResourcePath,
} from '../constants';
import AuditActionBadge from './AuditActionBadge';
import AuditActionTypeBadge from './AuditActionTypeBadge';
import AuditResourceBadge from './AuditResourceBadge';
import AuditStatusBadge from './AuditStatusBadge';
import AuditSeverityBadge from './AuditSeverityBadge';
import AuditChanges from './AuditChanges';
import './AuditLogDetails.css';

const Field = ({ label, children }) => (
  <div className="navix-audit-details__field">
    <dt className="navix-audit-details__label">{label}</dt>
    <dd className="navix-audit-details__value">{children}</dd>
  </div>
);

const DetailsCard = ({ title, children }) => (
  <Card className="navix-audit-details__card" padding="lg">
    <h2 className="navix-audit-details__title">{title}</h2>
    <dl className="navix-audit-details__grid">{children}</dl>
  </Card>
);

const AuditLogDetails = ({ log, onOpenResource }) => {
  const resourceMeta = getAuditResource(log.resourceType);
  const resourcePath = getAuditResourcePath(log.resourceType, log.resourceId);
  const hasResourceLink = resourcePath !== '/';

  return (
    <div className="navix-audit-details">
      <Card className="navix-audit-details__head" padding="lg">
        <div className="navix-audit-details__badges">
          <AuditActionBadge action={log.action} />
          <AuditActionTypeBadge actionType={log.actionType} />
          <AuditResourceBadge resourceType={log.resourceType} />
          <AuditStatusBadge status={log.status} />
          <AuditSeverityBadge severity={log.severity} />
        </div>
        <h2 className="navix-audit-details__description mb-0">{log.description}</h2>
        <div className="navix-audit-details__resource">
          <i className={`bi ${resourceMeta.icon}`} aria-hidden="true" />
          <span>{log.resourceName}</span>
        </div>
        {hasResourceLink && (
          <Button
            variant="outline"
            size="sm"
            icon="bi-box-arrow-up-right"
            onClick={() => onOpenResource?.(log)}
          >
            Ouvrir la ressource
          </Button>
        )}
      </Card>

      <div className="row g-3">
        <div className="col-12 col-xl-6">
          <DetailsCard title="Identification">
            <Field label="Identifiant">
              <code className="navix-audit-details__code">{log.id}</code>
            </Field>
            <Field label="Date">{formatAuditDateTime(log.createdAt)}</Field>
            <Field label="Ressource">
              {getAuditResource(log.resourceType).label} — {log.resourceId}
            </Field>
            <Field label="Famille d'action">{getAuditActionType(log.actionType).label}</Field>
            <Field label="Action">{getAuditAction(log.action).label}</Field>
          </DetailsCard>
        </div>

        <div className="col-12 col-xl-6">
          <DetailsCard title="Acteur">
            <Field label="Utilisateur">{log.userName}</Field>
            <Field label="Rôle">{getUser(log.userId).role ?? '—'}</Field>
            <Field label="Identifiant utilisateur">
              <code className="navix-audit-details__code">{log.userId}</code>
            </Field>
            <Field label="Entreprise">{log.companyName ?? '—'}</Field>
            <Field label="Agence">{log.agencyName ?? '—'}</Field>
          </DetailsCard>
        </div>

        <div className="col-12 col-xl-6">
          <DetailsCard title="Contexte réseau">
            <Field label="Adresse IP">
              <code className="navix-audit-details__code">{log.ipAddress ?? '—'}</code>
            </Field>
            <Field label="Navigateur / Appareil">
              <span className="navix-audit-details__ua">{log.userAgent ?? '—'}</span>
            </Field>
          </DetailsCard>
        </div>

        <div className="col-12 col-xl-6">
          <DetailsCard title="Résultat">
            <Field label="Statut">
              <AuditStatusBadge status={log.status} />
            </Field>
            <Field label="Sévérité">
              <AuditSeverityBadge severity={log.severity} />
            </Field>
            <Field label="Métadonnées">
              {log.metadata && Object.keys(log.metadata).length > 0 ? (
                <pre className="navix-audit-details__json">
                  {formatAuditValue(log.metadata)}
                </pre>
              ) : (
                '—'
              )}
            </Field>
          </DetailsCard>
        </div>
      </div>

      <Card className="navix-audit-details__card" padding="lg">
        <AuditChanges oldValues={log.oldValues} newValues={log.newValues} />
      </Card>
    </div>
  );
};

export default AuditLogDetails;
