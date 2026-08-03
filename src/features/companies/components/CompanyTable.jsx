/**
 * Navix Companies — CompanyTable
 * --------------------------------------------------------------------------
 * Tableau des entreprises (affichage desktop) : logo, nom, code, pays, ville,
 * abonnement, statut, véhicules, chauffeurs et actions.
 *
 * Props :
 *   companies : liste des entreprises à afficher (déjà filtrée/triée/paginée)
 *   onView    : (id: string) => void
 *   onEdit    : (id: string) => void
 *   onDelete  : (company: object) => void
 */
import { Badge, Button } from '@/components/ui';
import CompanyLogo from './CompanyLogo';
import CompanyStatusBadge from './CompanyStatusBadge';
import { getSubscriptionPlan } from '../constants';
import './CompanyTable.css';

const CompanyTable = ({ companies = [], onView, onEdit, onDelete }) => (
  <div className="table-responsive">
    <table className="table table-hover align-middle mb-0 navix-company-table">
      <thead>
        <tr>
          <th scope="col" className="navix-company-table__logo">
            <span className="visually-hidden">Logo</span>
          </th>
          <th scope="col">Nom</th>
          <th scope="col">Code</th>
          <th scope="col">Pays</th>
          <th scope="col">Ville</th>
          <th scope="col">Abonnement</th>
          <th scope="col">Statut</th>
          <th scope="col" className="text-end">Véhicules</th>
          <th scope="col" className="text-end">Chauffeurs</th>
          <th scope="col" className="text-end">
            <span className="visually-hidden">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {companies.map((company) => {
          const plan = getSubscriptionPlan(company.subscriptionPlan);

          return (
            <tr key={company.id}>
              <td className="navix-company-table__logo">
                <CompanyLogo src={company.logo} name={company.name} size="sm" />
              </td>
              <td>
                <button
                  type="button"
                  className="navix-company-table__name"
                  onClick={() => onView(company.id)}
                  title={`Voir ${company.name}`}
                >
                  {company.name}
                </button>
              </td>
              <td>
                <code className="text-secondary">{company.code}</code>
              </td>
              <td>{company.country}</td>
              <td>{company.city}</td>
              <td>
                <Badge variant={plan.variant} soft>
                  {plan.label}
                </Badge>
              </td>
              <td>
                <CompanyStatusBadge status={company.status} />
              </td>
              <td className="text-end tabular-nums">{company.vehicleCount}</td>
              <td className="text-end tabular-nums">{company.driverCount}</td>
              <td>
                <div className="d-flex justify-content-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="bi-eye"
                    onClick={() => onView(company.id)}
                    title="Voir le détail"
                    aria-label={`Voir le détail de ${company.name}`}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="bi-pencil"
                    onClick={() => onEdit(company.id)}
                    title="Modifier"
                    aria-label={`Modifier ${company.name}`}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="bi-trash3"
                    onClick={() => onDelete(company)}
                    title="Supprimer"
                    aria-label={`Supprimer ${company.name}`}
                  />
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

export default CompanyTable;
