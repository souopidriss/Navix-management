/**
 * Navix Agencies — AgencyCard
 * --------------------------------------------------------------------------
 * Carte d'une agence (affichage tablette / mobile) : nom, code, société,
 * type, statut, localisation et compteurs véhicules / chauffeurs.
 *
 * Props :
 *   agency    : agence à afficher
 *   company   : société rattachée (pour le libellé)
 *   onView    : (id: string) => void
 *   onEdit    : (id: string) => void
 *   onDelete  : (agency: object) => void
 */
import { Button } from '@/components/ui';
import AgencyStatusBadge from './AgencyStatusBadge';
import AgencyTypeBadge from './AgencyTypeBadge';
import './AgencyCard.css';

const AgencyCard = ({ agency, company, onView, onEdit, onDelete }) => (
  <article className="card h-100 navix-agency-card">
    <div className="card-body">
      <div className="d-flex align-items-start justify-content-between gap-2">
        <div className="min-w-0">
          <h2 className="navix-agency-card__name">
            <button type="button" className="navix-agency-card__link" onClick={() => onView(agency.id)}>
              {agency.name}
            </button>
          </h2>
          <p className="navix-agency-card__code mb-0">
            <code className="text-secondary">{agency.code}</code>
            {company && <span className="text-secondary"> · {company.name}</span>}
          </p>
        </div>
        <AgencyStatusBadge status={agency.status} />
      </div>

      <div className="d-flex flex-wrap gap-2 mt-3">
        <AgencyTypeBadge type={agency.type} />
      </div>

      <dl className="navix-agency-card__meta">
        <div>
          <dt>
            <i className="bi bi-geo-alt" aria-hidden="true" /> Localisation
          </dt>
          <dd>{[agency.city, agency.country].filter(Boolean).join(', ') || '—'}</dd>
        </div>
        {agency.region && (
          <div>
            <dt>
              <i className="bi bi-signpost" aria-hidden="true" /> Région
            </dt>
            <dd>{agency.region}</dd>
          </div>
        )}
      </dl>

      <div className="navix-agency-card__stats">
        <span title="Véhicules">
          <i className="bi bi-truck" aria-hidden="true" /> {agency.vehicleCount}
        </span>
        <span title="Chauffeurs">
          <i className="bi bi-person-badge" aria-hidden="true" /> {agency.driverCount}
        </span>
      </div>
    </div>

    <div className="card-footer d-flex justify-content-end gap-1">
      <Button variant="ghost" size="sm" icon="bi-eye" onClick={() => onView(agency.id)} title="Voir le détail" aria-label={`Voir le détail de ${agency.name}`} />
      <Button variant="ghost" size="sm" icon="bi-pencil" onClick={() => onEdit(agency.id)} title="Modifier" aria-label={`Modifier ${agency.name}`} />
      <Button variant="ghost" size="sm" icon="bi-trash3" onClick={() => onDelete(agency)} title="Supprimer" aria-label={`Supprimer ${agency.name}`} />
    </div>
  </article>
);

export default AgencyCard;
