/**
 * Navix Maintenance — MaintenanceCard
 * --------------------------------------------------------------------------
 * Carte d'un entretien (affichage tablette/mobile) : numéro, véhicule,
 * statut, alertes, type, priorité, date prévue, kilométrage, coût, atelier,
 * entreprise et actions.
 *
 * Props :
 *   maintenance   : entretien à afficher
 *   companyName   : nom de l'entreprise
 *   vehicleLabel  : libellé du véhicule (immatriculation ou marque/modèle)
 *   vehicle       : véhicule lié (alertes, kilométrage actuel)
 *   onView        : (id: string) => void
 *   onEdit        : (id: string) => void
 *   onDelete      : (maintenance: object) => void
 */
import { Badge, Button } from '@/components/ui';
import MaintenanceStatusBadge from './MaintenanceStatusBadge';
import MaintenancePriorityBadge from './MaintenancePriorityBadge';
import MaintenanceTypeBadge from './MaintenanceTypeBadge';
import MaintenanceAlertBadge from './MaintenanceAlertBadge';
import {
  formatMaintenanceDate,
  formatMaintenanceMoney,
  formatMaintenanceMileage,
  isMaintenanceFinished,
} from '../constants';
import './MaintenanceCard.css';

const MaintenanceCard = ({
  maintenance,
  companyName = '—',
  vehicleLabel = '—',
  vehicle,
  onView,
  onEdit,
  onDelete,
}) => {
  const finished = isMaintenanceFinished(maintenance);

  return (
    <article className="card h-100 navix-maint-card">
      <div className="card-body">
        <div className="d-flex align-items-start justify-content-between gap-2">
          <div className="min-w-0">
            <h2 className="navix-maint-card__name">
              <button type="button" className="navix-maint-card__link" onClick={() => onView(maintenance.id)}>
                {maintenance.maintenanceNumber}
              </button>
            </h2>
            <p className="navix-maint-card__vehicle mb-0">{vehicleLabel}</p>
          </div>
          <MaintenanceStatusBadge status={maintenance.status} />
        </div>

        <div className="navix-maint-card__alerts">
          <MaintenanceAlertBadge maintenance={maintenance} vehicle={vehicle} />
        </div>

        <div className="navix-maint-card__tags">
          <MaintenanceTypeBadge type={maintenance.maintenanceType} />
          <MaintenancePriorityBadge priority={maintenance.priority} />
        </div>

        <dl className="navix-maint-card__meta">
          <div>
            <dt>
              <i className="bi bi-calendar3" aria-hidden="true" /> Date prévue
            </dt>
            <dd>{formatMaintenanceDate(maintenance.scheduledDate)}</dd>
          </div>
          <div>
            <dt>
              <i className="bi bi-speedometer2" aria-hidden="true" /> Kilométrage
            </dt>
            <dd>{formatMaintenanceMileage(maintenance.mileage)}</dd>
          </div>
          <div>
            <dt>
              <i className="bi bi-cash-coin" aria-hidden="true" /> Coût
            </dt>
            <dd>{formatMaintenanceMoney(maintenance.actualCost || maintenance.estimatedCost, maintenance.currency)}</dd>
          </div>
          <div>
            <dt>
              <i className="bi bi-tools" aria-hidden="true" /> Atelier
            </dt>
            <dd>{maintenance.workshop || '—'}</dd>
          </div>
          <div>
            <dt>
              <i className="bi bi-buildings" aria-hidden="true" /> Entreprise
            </dt>
            <dd>{companyName}</dd>
          </div>
          {maintenance.priority === 'urgent' && (
            <div>
              <dt>
                <i className="bi bi-exclamation-triangle" aria-hidden="true" /> Priorité
              </dt>
              <dd>
                <Badge variant="danger" soft size="sm">
                  Urgente
                </Badge>
              </dd>
            </div>
          )}
        </dl>
      </div>

      <div className="card-footer d-flex justify-content-end gap-1">
        <Button
          variant="ghost"
          size="sm"
          icon="bi-eye"
          onClick={() => onView(maintenance.id)}
          title="Voir le détail"
          aria-label={`Voir le détail de ${maintenance.maintenanceNumber}`}
        />
        <Button
          variant="ghost"
          size="sm"
          icon="bi-pencil"
          onClick={() => onEdit(maintenance.id)}
          disabled={finished}
          title={finished ? 'Entretien clôturé' : 'Modifier'}
          aria-label={`Modifier ${maintenance.maintenanceNumber}`}
        />
        <Button
          variant="ghost"
          size="sm"
          icon="bi-trash3"
          onClick={() => onDelete(maintenance)}
          title="Supprimer"
          aria-label={`Supprimer ${maintenance.maintenanceNumber}`}
        />
      </div>
    </article>
  );
};

export default MaintenanceCard;
