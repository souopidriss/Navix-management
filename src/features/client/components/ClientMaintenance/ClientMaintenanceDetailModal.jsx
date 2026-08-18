import { Button } from '@/components/ui';
import { FormModal } from '@/components/core';
import { MaintenanceTimeline } from '@/features/maintenance/components';
import {
  getMaintenanceType,
  getMaintenancePriority,
  getMaintenanceStatus,
  formatMaintenanceDate,
  formatMaintenanceMoney,
  formatMaintenanceMileage,
  isMaintenanceFinished,
} from '@/features/maintenance/constants';

const DetailItem = ({ label, value, icon = 'bi-info-circle' }) => (
  <div className="navix-client-maint__detail-item">
    <div className="navix-client-maint__detail-label">
      <i className={`bi ${icon}`} aria-hidden="true" />
      <span>{label}</span>
    </div>
    <div className="navix-client-maint__detail-value">{value || '—'}</div>
  </div>
);

/**
 * Modale de détail d'un entretien Client : fiche véhicule, informations
 * complètes (atelier, coûts FCFA, pièces, travaux) et cycle de vie.
 * Lecture seule — les actions passent par les modales dédiées.
 */
const ClientMaintenanceDetailModal = ({ open, onClose, maintenance, vehicle }) => {
  const type = getMaintenanceType(maintenance?.maintenanceType);
  const priority = getMaintenancePriority(maintenance?.priority);
  const status = getMaintenanceStatus(maintenance?.status);

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title="Détail de l’entretien"
      subtitle={`${maintenance?.maintenanceNumber ?? ''} · ${type.label}`}
      icon="bi-wrench-adjustable"
      size="lg"
      footer={
        <Button variant="primary" icon="bi-check-lg" onClick={onClose}>
          Fermer
        </Button>
      }
    >
      <div className="d-grid gap-3">
        <div className="navix-client-maint__hero">
          <span className="navix-client-maint__icon">
            <i className={`bi ${type.icon}`} aria-hidden="true" />
          </span>
          <div className="flex-grow-1">
            <div className="navix-client-maint__vehicle">
              {vehicle ? `${vehicle.brand} ${vehicle.model}` : maintenance?.vehicleId}
            </div>
            <div className="small text-secondary">
              {vehicle ? vehicle.registrationNumber : ''}
              {vehicle ? ` · ${vehicle.category ?? ''}` : ''}
            </div>
            <div className="d-flex gap-2 mt-2 flex-wrap">
              <span className={`badge text-bg-${status.variant}`}>{status.label}</span>
              <span className={`badge text-bg-${priority.variant}`}>
                <i className={`bi ${priority.icon} me-1`} aria-hidden="true" />
                Priorité {priority.label?.toLowerCase() ?? 'inconnue'}
              </span>
            </div>
          </div>
        </div>

        <div className="navix-client-maint__detail-grid">
          <DetailItem label="Atelier" value={maintenance?.workshop} icon="bi-tools" />
          <DetailItem label="Mécanicien" value={maintenance?.mechanic} icon="bi-person-badge" />
          <DetailItem label="Fournisseur" value={maintenance?.supplier} icon="bi-box-seam" />
          <DetailItem label="Date prévue" value={formatMaintenanceDate(maintenance?.scheduledDate)} icon="bi-calendar2-event" />
          <DetailItem label="Kilométrage" value={formatMaintenanceMileage(maintenance?.mileage)} icon="bi-speedometer" />
          <DetailItem label="Coût estimé" value={formatMaintenanceMoney(maintenance?.estimatedCost, maintenance?.currency)} icon="bi-cash-stack" />
          <DetailItem label="Coût réel" value={formatMaintenanceMoney(maintenance?.actualCost, maintenance?.currency)} icon="bi-receipt" />
          <DetailItem label="Prochaine date" value={formatMaintenanceDate(maintenance?.nextMaintenanceDate)} icon="bi-calendar-check" />
        </div>

        <div className="navix-client-maint__detail-item">
          <div className="navix-client-maint__detail-label">
            <i className="bi bi-card-text" aria-hidden="true" />
            <span>Description</span>
          </div>
          <p className="mb-0">{maintenance?.description || '—'}</p>
        </div>

        {maintenance?.performedWork && (
          <div className="navix-client-maint__detail-item">
            <div className="navix-client-maint__detail-label">
              <i className="bi bi-hammer" aria-hidden="true" />
              <span>Travaux réalisés</span>
            </div>
            <p className="mb-0">{maintenance.performedWork}</p>
          </div>
        )}

        {Array.isArray(maintenance?.replacedParts) && maintenance.replacedParts.length > 0 && (
          <div className="navix-client-maint__detail-item">
            <div className="navix-client-maint__detail-label">
              <i className="bi bi-sliders" aria-hidden="true" />
              <span>Pièces remplacées</span>
            </div>
            <div className="navix-client-maint__parts">
              {maintenance.replacedParts.map((part, index) => (
                <span key={`${part}-${index}`} className="navix-client-maint__part">
                  <i className="bi bi-gear" aria-hidden="true" />
                  {part}
                </span>
              ))}
            </div>
          </div>
        )}

        {maintenance?.diagnostic && (
          <div className="navix-client-maint__detail-item">
            <div className="navix-client-maint__detail-label">
              <i className="bi bi-search" aria-hidden="true" />
              <span>Diagnostic</span>
            </div>
            <p className="mb-0">{maintenance.diagnostic}</p>
          </div>
        )}

        {maintenance?.notes && !isMaintenanceFinished(maintenance) && (
          <div className="navix-client-maint__detail-item">
            <div className="navix-client-maint__detail-label">
              <i className="bi bi-journal-text" aria-hidden="true" />
              <span>Notes</span>
            </div>
            <p className="mb-0">{maintenance.notes}</p>
          </div>
        )}

        <div className="navix-client-maint__detail-item">
          <div className="navix-client-maint__detail-label">
            <i className="bi bi-arrow-repeat" aria-hidden="true" />
            <span>Cycle de vie</span>
          </div>
          <MaintenanceTimeline maintenance={maintenance} />
        </div>
      </div>
    </FormModal>
  );
};

export default ClientMaintenanceDetailModal;
