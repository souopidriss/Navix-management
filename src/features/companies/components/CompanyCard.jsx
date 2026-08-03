/**
 * Navix Companies — CompanyCard
 * --------------------------------------------------------------------------
 * Carte d'une entreprise (affichage tablette/mobile) : logo, nom, code,
 * statut, plan, localisation et compteurs véhicules / chauffeurs / agences.
 *
 * Props :
 *   company  : entreprise à afficher
 *   onView   : (id: string) => void
 *   onEdit   : (id: string) => void
 *   onDelete : (company: object) => void
 */
import { Badge, Button } from '@/components/ui';
import CompanyLogo from './CompanyLogo';
import CompanyStatusBadge from './CompanyStatusBadge';
import { getSubscriptionPlan } from '../constants';
import './CompanyCard.css';

const CompanyCard = ({ company, onView, onEdit, onDelete }) => {
  const plan = getSubscriptionPlan(company.subscriptionPlan);

  return (
    <article className="card h-100 navix-company-card">
      <div className="card-body">
        <div className="d-flex align-items-start justify-content-between gap-2">
          <div className="d-flex align-items-center gap-3 min-w-0">
            <CompanyLogo src={company.logo} name={company.name} size="lg" />
            <div className="min-w-0">
              <h2 className="navix-company-card__name">
                <button type="button" className="navix-company-card__link" onClick={() => onView(company.id)}>
                  {company.name}
                </button>
              </h2>
              <p className="navix-company-card__code mb-0">
                <code className="text-secondary">{company.code}</code>
              </p>
            </div>
          </div>
          <CompanyStatusBadge status={company.status} />
        </div>

        <dl className="navix-company-card__meta">
          <div>
            <dt>
              <i className="bi bi-geo-alt" aria-hidden="true" /> Localisation
            </dt>
            <dd>
              {company.city}, {company.country}
            </dd>
          </div>
          <div>
            <dt>
              <i className="bi bi-credit-card" aria-hidden="true" /> Abonnement
            </dt>
            <dd>
              <Badge variant={plan.variant} soft>
                {plan.label}
              </Badge>
            </dd>
          </div>
        </dl>

        <div className="navix-company-card__stats">
          <span title="Véhicules">
            <i className="bi bi-truck" aria-hidden="true" /> {company.vehicleCount}
          </span>
          <span title="Chauffeurs">
            <i className="bi bi-person-badge" aria-hidden="true" /> {company.driverCount}
          </span>
          <span title="Agences">
            <i className="bi bi-diagram-3" aria-hidden="true" /> {company.agencyCount}
          </span>
        </div>
      </div>

      <div className="card-footer d-flex justify-content-end gap-1">
        <Button variant="ghost" size="sm" icon="bi-eye" onClick={() => onView(company.id)} title="Voir le détail" aria-label={`Voir le détail de ${company.name}`} />
        <Button variant="ghost" size="sm" icon="bi-pencil" onClick={() => onEdit(company.id)} title="Modifier" aria-label={`Modifier ${company.name}`} />
        <Button variant="ghost" size="sm" icon="bi-trash3" onClick={() => onDelete(company)} title="Supprimer" aria-label={`Supprimer ${company.name}`} />
      </div>
    </article>
  );
};

export default CompanyCard;
